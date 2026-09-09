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
	"time"

	"asset-management-backend/models"
)

// Default Google Apps Script Webhook URL provided by user
const DefaultGoogleSheetWebhookURL = "https://script.google.com/macros/s/AKfycbxRXL60b25tRSoklMditNASpWGButurIl7pdUVj2b3H6jpWKuJcFn6FsA7ennOjZdGq/exec"

// SheetAssetPayload represents the format expected by Google Apps Script doPost()
type SheetAssetPayload struct {
	Branch         string `json:"branch"`
	Site           string `json:"site"`
	Category       string `json:"category"`
	Brand          string `json:"brand"`
	Model          string `json:"model"`
	SerialNumber   string `json:"serial_number"`
	UnitCount      int    `json:"unit_count"`
	AssetType      string `json:"asset_type"`
	Status         string `json:"status"`
	Condition      string `json:"condition"`
	Ownership      string `json:"ownership"`
	LocationDetail string `json:"location_detail"`
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
	branchName := "-"
	siteName := fmt.Sprintf("Site ID %d", asset.SiteID)
	categoryName := "-"

	if asset.Site != nil {
		siteName = asset.Site.SiteName
		if asset.Site.PartnerName != "" {
			siteName = fmt.Sprintf("%s (%s)", asset.Site.SiteName, asset.Site.PartnerName)
		}
		if asset.Site.Branch != nil {
			branchName = asset.Site.Branch.Name
		}
	}

	if asset.Category != nil && asset.Category.Name != "" {
		categoryName = asset.Category.Name
	}

	createdTime := time.Now().Format("2006-01-02 15:04:05")
	if !asset.CreatedAt.IsZero() {
		createdTime = asset.CreatedAt.Format("2006-01-02 15:04:05")
	}

	return SheetAssetPayload{
		Branch:         branchName,
		Site:           siteName,
		Category:       categoryName,
		Brand:          asset.Brand,
		Model:          asset.Model,
		SerialNumber:   asset.SerialNumber,
		UnitCount:      asset.UnitCount,
		AssetType:      asset.AssetType,
		Status:         asset.Status,
		Condition:      asset.Condition,
		Ownership:      asset.Ownership,
		LocationDetail: asset.LocationDetail,
		Notes:          asset.Notes,
		CreatedBy:      createdBy,
		CreatedAt:      createdTime,
	}
}

// SyncAssetToGoogleSheet sends a newly created asset to Google Spreadsheet in background
func SyncAssetToGoogleSheet(asset *models.Asset, createdBy string) {
	webhookURL := GetGoogleSheetWebhookURL()
	if webhookURL == "" {
		return
	}

	payload := BuildSheetPayload(asset, createdBy)

	// Execute in asynchronous goroutine so main HTTP request is never delayed
	go func() {
		if err := sendPayloadToGoogleSheet(webhookURL, payload); err != nil {
			log.Printf("[GOOGLE_SHEET_SYNC] Gagal sync aset ID %d (%s %s): %v", asset.ID, asset.Brand, asset.Model, err)
		} else {
			log.Printf("[GOOGLE_SHEET_SYNC] Berhasil sync aset ID %d (%s %s) ke Google Sheet", asset.ID, asset.Brand, asset.Model)
		}
	}()
}

// SyncAssetsBatchToGoogleSheet sends multiple assets to Google Spreadsheet in background
func SyncAssetsBatchToGoogleSheet(payloads []SheetAssetPayload) {
	if len(payloads) == 0 {
		return
	}

	webhookURL := GetGoogleSheetWebhookURL()
	if webhookURL == "" {
		return
	}

	go func() {
		if err := sendPayloadToGoogleSheet(webhookURL, payloads); err != nil {
			log.Printf("[GOOGLE_SHEET_SYNC] Gagal sync batch %d aset ke Google Sheet: %v", len(payloads), err)
		} else {
			log.Printf("[GOOGLE_SHEET_SYNC] Berhasil sync batch %d aset ke Google Sheet", len(payloads))
		}
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
