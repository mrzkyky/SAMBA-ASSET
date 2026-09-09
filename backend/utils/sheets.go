package utils

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"

	"asset-management-backend/models"
)

// Default Google Apps Script Webhook URL provided by user
const DefaultGoogleSheetWebhookURL = "https://script.google.com/macros/s/AKfycbxRXL60b25tRSoklMditNASpWGButurIl7pdUVj2b3H6jpWKuJcFn6FsA7ennOjZdGq/exec"

// SheetAssetPayload represents the format expected by Google Apps Script doPost()
type SheetAssetPayload struct {
	Action         string `json:"action,omitempty"`
	ID             uint   `json:"id"`
	BranchCode     string `json:"branch_code"`
	BranchName     string `json:"branch_name"`
	Branch         string `json:"branch"`
	PartnerName    string `json:"partner_name"`
	Partner        string `json:"partner"`
	Site           string `json:"site"`
	SegmentName    string `json:"segment_name"`
	Segment        string `json:"segment"`
	CategoryName   string `json:"category_name"`
	Category       string `json:"category"`
	AssetType      string `json:"asset_type"`
	Ownership      string `json:"ownership"`
	Brand          string `json:"brand"`
	Model          string `json:"model"`
	SerialNumber   string `json:"serial_number"`
	LocationDetail string `json:"location_detail"`
	UnitCount      int    `json:"unit_count"`
	Status         string `json:"status"`
	Condition      string `json:"condition"`
	Notes          string `json:"notes"`
	CreatedBy      string `json:"created_by"`
	CreatedAt      string `json:"created_at"`
}

// GetGoogleSheetWebhookURL returns the configured webhook URL or fallback default
func GetGoogleSheetWebhookURL() string {
	url := strings.TrimSpace(os.Getenv("GOOGLE_SHEET_WEBHOOK_URL"))
	if url == "" {
		return DefaultGoogleSheetWebhookURL
	}
	if strings.ToLower(url) == "disabled" || strings.ToLower(url) == "off" {
		return ""
	}
	return url
}

// BuildSheetPayload maps an Asset model to the webhook payload
func BuildSheetPayload(asset *models.Asset, createdBy string) SheetAssetPayload {
	branchCode := "-"
	branchName := "-"
	partnerName := "-"
	siteName := fmt.Sprintf("Site ID %d", asset.SiteID)
	segmentName := "-"
	categoryName := "-"

	if asset.Site != nil {
		siteName = asset.Site.SiteName
		if asset.Site.PartnerName != "" {
			partnerName = asset.Site.PartnerName
			siteName = fmt.Sprintf("%s (%s)", asset.Site.SiteName, asset.Site.PartnerName)
		}
		if asset.Site.Branch != nil {
			branchCode = asset.Site.Branch.Code
			branchName = asset.Site.Branch.Name
		}
	}

	if asset.Category != nil && asset.Category.Name != "" {
		categoryName = asset.Category.Name
	}

	if asset.Segment != nil && asset.Segment.Name != "" {
		segmentName = asset.Segment.Name
	}

	createdTime := time.Now().Format("2006-01-02 15:04:05")
	if !asset.CreatedAt.IsZero() {
		createdTime = asset.CreatedAt.Format("2006-01-02 15:04:05")
	}

	if createdBy == "" {
		createdBy = "User"
	}

	return SheetAssetPayload{
		ID:             asset.ID,
		BranchCode:     branchCode,
		BranchName:     branchName,
		Branch:         branchName,
		PartnerName:    partnerName,
		Partner:        partnerName,
		Site:           siteName,
		SegmentName:    segmentName,
		Segment:        segmentName,
		CategoryName:   categoryName,
		Category:       categoryName,
		AssetType:      asset.AssetType,
		Ownership:      asset.Ownership,
		Brand:          asset.Brand,
		Model:          asset.Model,
		SerialNumber:   asset.SerialNumber,
		LocationDetail: asset.LocationDetail,
		UnitCount:      asset.UnitCount,
		Status:         asset.Status,
		Condition:      asset.Condition,
		Notes:          asset.Notes,
		CreatedBy:      createdBy,
		CreatedAt:      createdTime,
	}
}

// SyncAssetToGoogleSheet sends a created or updated asset to Google Spreadsheet in background
func SyncAssetToGoogleSheet(asset *models.Asset, createdBy string, action string) {
	webhookURL := GetGoogleSheetWebhookURL()
	if webhookURL == "" {
		return
	}

	payload := BuildSheetPayload(asset, createdBy)
	if action != "" {
		payload.Action = action
	} else {
		payload.Action = "UPSERT"
	}

	// Execute in asynchronous goroutine so main HTTP request is never delayed
	go func() {
		if err := sendPayloadToGoogleSheet(webhookURL, payload); err != nil {
			log.Printf("[GOOGLE_SHEET_SYNC] Gagal sync (%s) aset ID %d (%s %s): %v", payload.Action, asset.ID, asset.Brand, asset.Model, err)
		} else {
			log.Printf("[GOOGLE_SHEET_SYNC] Berhasil sync (%s) aset ID %d (%s %s) ke Google Sheet", payload.Action, asset.ID, asset.Brand, asset.Model)
		}
	}()
}

// SyncAssetDeleteToGoogleSheet sends a deletion command to Google Spreadsheet
func SyncAssetDeleteToGoogleSheet(assetID uint) {
	webhookURL := GetGoogleSheetWebhookURL()
	if webhookURL == "" {
		return
	}

	payload := map[string]interface{}{
		"action": "DELETE",
		"id":     assetID,
	}

	go func() {
		if err := sendPayloadToGoogleSheet(webhookURL, payload); err != nil {
			log.Printf("[GOOGLE_SHEET_SYNC] Gagal sync hapus aset ID %d: %v", assetID, err)
		} else {
			log.Printf("[GOOGLE_SHEET_SYNC] Berhasil sync hapus aset ID %d dari Google Sheet", assetID)
		}
	}()
}

// SyncAssetsBatchToGoogleSheet sends multiple assets to Google Spreadsheet in background using worker pool
func SyncAssetsBatchToGoogleSheet(payloads []SheetAssetPayload) {
	if len(payloads) == 0 {
		return
	}

	webhookURL := GetGoogleSheetWebhookURL()
	if webhookURL == "" {
		return
	}

	go func() {
		log.Printf("[GOOGLE_SHEET_SYNC] Memulai proses sync batch %d aset ke Google Sheet...", len(payloads))
		// Concurrency limited to 5 workers to avoid overloading Apps Script rate limits
		sem := make(chan struct{}, 5)
		var wg sync.WaitGroup
		successCount := 0
		var mu sync.Mutex

		for _, p := range payloads {
			sem <- struct{}{}
			wg.Add(1)

			go func(item SheetAssetPayload) {
				defer func() {
					<-sem
					wg.Done()
				}()

				if err := sendPayloadToGoogleSheet(webhookURL, item); err == nil {
					mu.Lock()
					successCount++
					mu.Unlock()
				}
			}(p)
		}

		wg.Wait()
		log.Printf("[GOOGLE_SHEET_SYNC] Selesai sync batch: %d dari %d aset berhasil masuk ke Google Sheet", successCount, len(payloads))
	}()
}

// sendPayloadToGoogleSheet performs HTTP POST with automatic redirect following
func sendPayloadToGoogleSheet(webhookURL string, data interface{}) error {
	jsonData, err := json.Marshal(data)
	if err != nil {
		return fmt.Errorf("marshal json failed: %w", err)
	}

	client := &http.Client{
		Timeout: 30 * time.Second,
	}

	resp, err := client.Post(webhookURL, "application/json", bytes.NewReader(jsonData))
	if err != nil {
		return fmt.Errorf("http post error: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		bodyBytes, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("server returned status %d: %s", resp.StatusCode, string(bodyBytes))
	}

	return nil
}
