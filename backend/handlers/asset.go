package handlers

import (
	"bytes"
	"encoding/csv"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"asset-management-backend/config"
	"asset-management-backend/models"
	"github.com/gin-gonic/gin"
)

// cleanSerialNumbers formats raw multi-SN string into clean comma-separated list and calculates count
func cleanSerialNumbers(rawSN string) (string, int) {
	// Replace newlines and semicolons with commas
	replaced := strings.ReplaceAll(rawSN, "\r\n", ",")
	replaced = strings.ReplaceAll(replaced, "\n", ",")
	replaced = strings.ReplaceAll(replaced, ";", ",")

	parts := strings.Split(replaced, ",")
	cleanParts := make([]string, 0)

	for _, p := range parts {
		trimmed := strings.TrimSpace(p)
		if trimmed != "" {
			cleanParts = append(cleanParts, trimmed)
		}
	}

	if len(cleanParts) == 0 {
		return strings.TrimSpace(rawSN), 1
	}

	return strings.Join(cleanParts, ", "), len(cleanParts)
}

// GetAssets handles server-side pagination, global search & filtering
func GetAssets(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}
	offset := (page - 1) * limit

	query := config.DB.Model(&models.Asset{}).
		Preload("Site.Branch").
		Preload("Category").
		Preload("Segment")

	// Global Search Query (Serial Number, Brand, Model, Location, Notes, Site, Branch, Category, Segment, AssetType, Condition, Ownership)
	search := strings.TrimSpace(c.Query("q"))
	branchID := strings.TrimSpace(c.Query("branch_id"))

	if search != "" {
		searchPattern := "%" + strings.ToLower(search) + "%"
		query = query.Joins("LEFT JOIN sites ON sites.id = assets.site_id").
			Joins("LEFT JOIN branches ON branches.id = sites.branch_id").
			Joins("LEFT JOIN categories ON categories.id = assets.category_id").
			Joins("LEFT JOIN segments ON segments.id = assets.segment_id").
			Where(
				"LOWER(assets.serial_number) LIKE ? OR LOWER(assets.brand) LIKE ? OR LOWER(assets.model) LIKE ? OR LOWER(assets.location_detail) LIKE ? OR LOWER(assets.notes) LIKE ? OR LOWER(assets.asset_type) LIKE ? OR LOWER(assets.status) LIKE ? OR LOWER(assets.condition) LIKE ? OR LOWER(assets.ownership) LIKE ? OR LOWER(sites.site_name) LIKE ? OR LOWER(sites.partner_name) LIKE ? OR LOWER(branches.name) LIKE ? OR LOWER(branches.code) LIKE ? OR LOWER(categories.name) LIKE ? OR LOWER(segments.name) LIKE ?",
				searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern,
			)
	} else if branchID != "" {
		// Only join sites if search hasn't already joined it
		query = query.Joins("JOIN sites ON sites.id = assets.site_id")
	}

	// Filter by Branch
	if branchID != "" {
		query = query.Where("sites.branch_id = ?", branchID)
	}

	// Filter by Site
	siteID := c.Query("site_id")
	if siteID != "" {
		query = query.Where("assets.site_id = ?", siteID)
	}

	// Filter by Category
	categoryID := c.Query("category_id")
	if categoryID != "" {
		query = query.Where("assets.category_id = ?", categoryID)
	}

	// Filter by Asset Type (Aktif, Pasif, Interconnect, Power)
	assetType := c.Query("asset_type")
	if assetType != "" {
		query = query.Where("assets.asset_type = ?", assetType)
	}

	// Filter by Status (Aktif, Nonaktif, Maintenance, Rusak, Retired, Hilang)
	status := c.Query("status")
	if status != "" {
		query = query.Where("assets.status = ?", status)
	}

	// Filter by Condition (Baik, Perlu Perbaikan, Rusak)
	condition := c.Query("condition")
	if condition != "" {
		query = query.Where("assets.condition = ?", condition)
	}

	// Filter by Ownership (Aset Tetap, Aset Hibah)
	ownership := c.Query("ownership")
	if ownership != "" {
		query = query.Where("assets.ownership = ?", ownership)
	}

	// Filter by Segment
	segmentID := c.Query("segment_id")
	if segmentID != "" {
		query = query.Where("assets.segment_id = ?", segmentID)
	}

	var total int64
	query.Count(&total)

	// Sorting
	sortBy := c.DefaultQuery("sort_by", "created_at")
	order := c.DefaultQuery("order", "desc")
	validSorts := map[string]bool{
		"id": true, "brand": true, "model": true, "serial_number": true,
		"asset_type": true, "status": true, "condition": true, "unit_count": true, "created_at": true,
	}
	if !validSorts[sortBy] {
		sortBy = "created_at"
	}
	if strings.ToLower(order) != "asc" {
		order = "desc"
	}

	var assets []models.Asset
	if err := query.Order(fmt.Sprintf("assets.%s %s", sortBy, order)).
		Limit(limit).
		Offset(offset).
		Find(&assets).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data aset"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":        assets,
		"total":       total,
		"page":        page,
		"limit":       limit,
		"total_pages": (total + int64(limit) - 1) / int64(limit),
	})
}

// GetAssetByID returns details of a single asset
func GetAssetByID(c *gin.Context) {
	id := c.Param("id")
	var asset models.Asset
	if err := config.DB.Preload("Site.Branch").Preload("Category").Preload("Segment").First(&asset, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Aset tidak ditemukan"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": asset})
}

// CreateAsset creates a new asset with multi-SN auto formatting
func CreateAsset(c *gin.Context) {
	var input models.Asset
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if input.AssetType == "" {
		input.AssetType = "Aktif"
	}
	if input.Status == "" {
		input.Status = "Aktif"
	}
	if input.Condition == "" {
		input.Condition = "Baik"
	}
	if input.Ownership == "" {
		input.Ownership = "Aset Tetap"
	}

	// Validate SegmentID: if 0 or invalid, set to nil to avoid FK violation
	if input.SegmentID != nil {
		if *input.SegmentID == 0 {
			input.SegmentID = nil
		} else {
			var segCount int64
			config.DB.Model(&models.Segment{}).Where("id = ?", *input.SegmentID).Count(&segCount)
			if segCount == 0 {
				input.SegmentID = nil
			}
		}
	}

	// Clean multi-SN string & auto-update unit count if multiple SNs provided
	cleanSN, snCount := cleanSerialNumbers(input.SerialNumber)
	input.SerialNumber = cleanSN
	if snCount > 1 || input.UnitCount <= 1 {
		input.UnitCount = snCount
	}

	if err := config.DB.Create(&input).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Gagal menambahkan aset: %v", err)})
		return
	}

	config.DB.Preload("Site.Branch").Preload("Category").Preload("Segment").First(&input, input.ID)

	// Record Audit Log for Asset Creation
	userIDPtr, username := getUserContext(c)
	siteInfo := fmt.Sprintf("Site ID %d", input.SiteID)
	if input.Site != nil {
		siteInfo = fmt.Sprintf("%s (%s)", input.Site.SiteName, input.Site.PartnerName)
	}
	auditDetails := fmt.Sprintf("Menambahkan Aset Baru: %s / %s (SN: %s, %d Unit) di %s. Jenis: %s, Status: %s, Kondisi: %s, Kepemilikan: %s",
		input.Brand, input.Model, input.SerialNumber, input.UnitCount, siteInfo, input.AssetType, input.Status, input.Condition, input.Ownership)
	config.RecordAuditLog(userIDPtr, username, "TAMBAH_ASET", auditDetails, c.ClientIP())

	c.JSON(http.StatusCreated, gin.H{"message": "Aset berhasil ditambahkan", "data": input})
}

// UpdateAsset updates an existing asset and records delta change audit history
func UpdateAsset(c *gin.Context) {
	id := c.Param("id")
	var oldAsset models.Asset
	if err := config.DB.Preload("Site.Branch").Preload("Category").Preload("Segment").First(&oldAsset, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Aset tidak ditemukan"})
		return
	}

	var input models.Asset
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Validate SegmentID: if 0 or invalid, set to nil
	if input.SegmentID != nil {
		if *input.SegmentID == 0 {
			input.SegmentID = nil
		} else {
			var segCount int64
			config.DB.Model(&models.Segment{}).Where("id = ?", *input.SegmentID).Count(&segCount)
			if segCount == 0 {
				input.SegmentID = nil
			}
		}
	}

	cleanSN, snCount := cleanSerialNumbers(input.SerialNumber)
	finalUnitCount := input.UnitCount
	if snCount > 1 {
		finalUnitCount = snCount
	}

	if input.AssetType == "" {
		input.AssetType = "Aktif"
	}
	if input.Status == "" {
		input.Status = "Aktif"
	}
	if input.Condition == "" {
		input.Condition = "Baik"
	}
	if input.Ownership == "" {
		input.Ownership = "Aset Tetap"
	}

	// Calculate Delta Changes for Audit Log
	changes := make([]string, 0)
	if oldAsset.Brand != input.Brand || oldAsset.Model != input.Model {
		changes = append(changes, fmt.Sprintf("Perangkat: %s %s ➔ %s %s", oldAsset.Brand, oldAsset.Model, input.Brand, input.Model))
	}
	if oldAsset.SiteID != input.SiteID {
		changes = append(changes, fmt.Sprintf("Lokasi Site: ID %d ➔ ID %d", oldAsset.SiteID, input.SiteID))
	}
	if oldAsset.CategoryID != input.CategoryID {
		changes = append(changes, fmt.Sprintf("Kategori: ID %d ➔ ID %d", oldAsset.CategoryID, input.CategoryID))
	}
	if oldAsset.AssetType != input.AssetType {
		changes = append(changes, fmt.Sprintf("Jenis Asset: %s ➔ %s", oldAsset.AssetType, input.AssetType))
	}
	if oldAsset.LocationDetail != input.LocationDetail {
		changes = append(changes, fmt.Sprintf("Lokasi Detail: %s ➔ %s", oldAsset.LocationDetail, input.LocationDetail))
	}
	if oldAsset.Status != input.Status {
		changes = append(changes, fmt.Sprintf("Status: %s ➔ %s", oldAsset.Status, input.Status))
	}
	if oldAsset.Condition != input.Condition {
		changes = append(changes, fmt.Sprintf("Kondisi: %s ➔ %s", oldAsset.Condition, input.Condition))
	}
	if oldAsset.Ownership != input.Ownership {
		changes = append(changes, fmt.Sprintf("Kepemilikan: %s ➔ %s", oldAsset.Ownership, input.Ownership))
	}
	if oldAsset.SerialNumber != cleanSN {
		changes = append(changes, fmt.Sprintf("Serial Number: %s ➔ %s", oldAsset.SerialNumber, cleanSN))
	}
	if oldAsset.UnitCount != finalUnitCount {
		changes = append(changes, fmt.Sprintf("Jumlah Unit: %d ➔ %d", oldAsset.UnitCount, finalUnitCount))
	}
	if strings.TrimSpace(oldAsset.Notes) != strings.TrimSpace(input.Notes) {
		changes = append(changes, fmt.Sprintf("Catatan: \"%s\" ➔ \"%s\"", oldAsset.Notes, input.Notes))
	}

	updateMap := map[string]interface{}{
		"site_id":         input.SiteID,
		"category_id":     input.CategoryID,
		"segment_id":      input.SegmentID,
		"asset_type":      input.AssetType,
		"brand":           input.Brand,
		"model":           input.Model,
		"serial_number":   cleanSN,
		"location_detail": input.LocationDetail,
		"unit_count":      finalUnitCount,
		"status":          input.Status,
		"condition":       input.Condition,
		"ownership":       input.Ownership,
		"notes":           input.Notes,
	}

	if err := config.DB.Model(&models.Asset{}).Where("id = ?", oldAsset.ID).Updates(updateMap).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Gagal memperbarui aset: %v", err)})
		return
	}

	var updatedAsset models.Asset
	config.DB.Preload("Site.Branch").Preload("Category").Preload("Segment").First(&updatedAsset, oldAsset.ID)

	// Record Audit Log with Change Delta
	changeSummary := "Diperbarui tanpa perubahan parameter utama"
	if len(changes) > 0 {
		changeSummary = strings.Join(changes, " | ")
	}
	siteName := "Site"
	if oldAsset.Site != nil {
		siteName = fmt.Sprintf("%s (%s)", oldAsset.Site.SiteName, oldAsset.Site.PartnerName)
	}
	auditDetails := fmt.Sprintf("Mengubah Aset #%d [%s / %s di %s]: %s",
		oldAsset.ID, oldAsset.Brand, oldAsset.Model, siteName, changeSummary)

	userIDPtr, username := getUserContext(c)
	config.RecordAuditLog(userIDPtr, username, "EDIT_ASET", auditDetails, c.ClientIP())

	c.JSON(http.StatusOK, gin.H{"message": "Aset berhasil diperbarui", "data": updatedAsset})
}

// DeleteAsset deletes an asset and records audit history
func DeleteAsset(c *gin.Context) {
	id := c.Param("id")
	var asset models.Asset
	if err := config.DB.Preload("Site").First(&asset, id).Error; err == nil {
		siteName := "Site"
		if asset.Site != nil {
			siteName = fmt.Sprintf("%s (%s)", asset.Site.SiteName, asset.Site.PartnerName)
		}
		userIDPtr, username := getUserContext(c)
		auditDetails := fmt.Sprintf("Menghapus Aset #%d: %s / %s (SN: %s) di %s",
			asset.ID, asset.Brand, asset.Model, asset.SerialNumber, siteName)
		config.RecordAuditLog(userIDPtr, username, "HAPUS_ASET", auditDetails, c.ClientIP())
	}

	if err := config.DB.Delete(&models.Asset{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus aset"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Aset berhasil dihapus"})
}

// Helper to extract user info from gin context
func getUserContext(c *gin.Context) (*uint, string) {
	usernameVal, exists := c.Get("username")
	username := "System"
	if exists {
		if uStr, ok := usernameVal.(string); ok && uStr != "" {
			username = uStr
		}
	}

	var userIDPtr *uint
	if idVal, exists := c.Get("user_id"); exists {
		if uid, ok := idVal.(uint); ok {
			userIDPtr = &uid
		}
	}
	return userIDPtr, username
}

// ExportAssets generates a CSV export for filtered assets
func ExportAssets(c *gin.Context) {
	query := config.DB.Model(&models.Asset{}).
		Preload("Site.Branch").
		Preload("Category").
		Preload("Segment")

	branchID := c.Query("branch_id")
	if branchID != "" {
		query = query.Joins("JOIN sites ON sites.id = assets.site_id").
			Where("sites.branch_id = ?", branchID)
	}

	siteID := c.Query("site_id")
	if siteID != "" {
		query = query.Where("assets.site_id = ?", siteID)
	}

	ownership := c.Query("ownership")
	if ownership != "" {
		query = query.Where("assets.ownership = ?", ownership)
	}

	var assets []models.Asset
	if err := query.Order("assets.id ASC").Find(&assets).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data untuk ekspor"})
		return
	}

	b := &bytes.Buffer{}
	w := csv.NewWriter(b)

	header := []string{
		"ID", "Kode Cabang", "Nama Cabang", "Mitra / Partner", "Nama Site",
		"Segmen Layanan", "Kategori", "Jenis Asset", "Status Kepemilikan", "Merek", "Tipe / Model", "Serial Number",
		"Lokasi Detail / Rak", "Jumlah Unit", "Status", "Kondisi", "Catatan",
	}
	if err := w.Write(header); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membuat header CSV"})
		return
	}

	for _, a := range assets {
		branchCode := ""
		branchName := ""
		partnerName := ""
		siteName := ""
		categoryName := ""
		segmentName := ""

		if a.Site != nil {
			partnerName = a.Site.PartnerName
			siteName = a.Site.SiteName
			if a.Site.Branch != nil {
				branchCode = a.Site.Branch.Code
				branchName = a.Site.Branch.Name
			}
		}
		if a.Category != nil {
			categoryName = a.Category.Name
		}
		if a.Segment != nil {
			segmentName = a.Segment.Name
		}

		ownershipVal := a.Ownership
		if ownershipVal == "" {
			ownershipVal = "Aset Tetap"
		}

		record := []string{
			fmt.Sprintf("%d", a.ID),
			branchCode,
			branchName,
			partnerName,
			siteName,
			segmentName,
			categoryName,
			a.AssetType,
			ownershipVal,
			a.Brand,
			a.Model,
			a.SerialNumber,
			a.LocationDetail,
			fmt.Sprintf("%d", a.UnitCount),
			a.Status,
			a.Condition,
			a.Notes,
		}
		_ = w.Write(record)
	}
	w.Flush()

	filename := "Aset_Nasional_Export.csv"
	if branchID != "" {
		filename = fmt.Sprintf("Aset_Cabang_%s.csv", branchID)
	}

	c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=%s", filename))
	c.Header("Content-Type", "text/csv; charset=utf-8")
	c.String(http.StatusOK, b.String())
}

// ImportAssetItem represents a parsed row for bulk import
type ImportAssetItem struct {
	SiteID         *uint  `json:"site_id"`
	SiteName       string `json:"site_name"`
	PartnerName    string `json:"partner_name"`
	BranchName     string `json:"branch_name"`
	BranchCode     string `json:"branch_code"`
	CategoryName   string `json:"category_name"`
	SegmentName    string `json:"segment_name"`
	AssetType      string `json:"asset_type"`
	Brand          string `json:"brand"`
	Model          string `json:"model"`
	SerialNumber   string `json:"serial_number"`
	LocationDetail string `json:"location_detail"`
	UnitCount      int    `json:"unit_count"`
	Status         string `json:"status"`
	Condition      string `json:"condition"`
	Ownership      string `json:"ownership"`
	Notes          string `json:"notes"`
}

// ImportAssetsRequest represents the batch import request payload
type ImportAssetsRequest struct {
	DefaultSiteID *uint             `json:"default_site_id"`
	Items         []ImportAssetItem `json:"items"`
}

// ImportErrorDetail represents a row validation or processing error
type ImportErrorDetail struct {
	RowIndex int    `json:"row_index"`
	Brand    string `json:"brand"`
	Model    string `json:"model"`
	Error    string `json:"error"`
}

// ImportAssets handles bulk asset insertion from spreadsheet/CSV data
func ImportAssets(c *gin.Context) {
	var req ImportAssetsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Format data import tidak valid: %v", err)})
		return
	}

	if len(req.Items) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Tidak ada baris data aset untuk diimpor"})
		return
	}

	// Extract user context & role constraints
	userIDPtr, username := getUserContext(c)
	roleVal, _ := c.Get("user_role")
	role, _ := roleVal.(string)
	var userBranchID *uint
	if bVal, exists := c.Get("user_branch_id"); exists {
		if bid, ok := bVal.(uint); ok {
			userBranchID = &bid
		}
	}

	// Pre-load all branches, sites, categories, and segments for in-memory resolution
	var allBranches []models.Branch
	config.DB.Find(&allBranches)

	var defaultBranchID uint = 1
	if len(allBranches) > 0 {
		defaultBranchID = allBranches[0].ID
	}
	if userBranchID != nil && *userBranchID > 0 {
		defaultBranchID = *userBranchID
	}

	var allSites []models.Site
	config.DB.Preload("Branch").Find(&allSites)

	siteByID := make(map[uint]models.Site)
	siteByName := make(map[string]models.Site)
	siteByPartner := make(map[string]models.Site)
	for _, s := range allSites {
		siteByID[s.ID] = s
		if s.SiteName != "" {
			siteByName[strings.ToLower(strings.TrimSpace(s.SiteName))] = s
		}
		if s.PartnerName != "" {
			siteByPartner[strings.ToLower(strings.TrimSpace(s.PartnerName))] = s
		}
	}

	var allCategories []models.Category
	config.DB.Find(&allCategories)
	categoryByName := make(map[string]uint)
	for _, cat := range allCategories {
		categoryByName[strings.ToLower(strings.TrimSpace(cat.Name))] = cat.ID
	}

	var allSegments []models.Segment
	config.DB.Find(&allSegments)
	segmentByName := make(map[string]uint)
	for _, seg := range allSegments {
		segmentByName[strings.ToLower(strings.TrimSpace(seg.Name))] = seg.ID
	}

	var createdAssets []models.Asset
	var importErrors []ImportErrorDetail

	// Process each item
	for idx, item := range req.Items {
		rowNumber := idx + 1
		brand := strings.TrimSpace(item.Brand)
		model := strings.TrimSpace(item.Model)
		rawSN := strings.TrimSpace(item.SerialNumber)

		// Smart Fallbacks for essential fields if blank
		if brand == "" {
			if item.CategoryName != "" {
				brand = item.CategoryName
			} else {
				brand = "Perangkat Jaringan"
			}
		}
		if model == "" {
			model = "Unit Standar"
		}

		// 1. Resolve Site
		var targetSite models.Site
		var siteFound bool

		if item.SiteID != nil && *item.SiteID > 0 {
			if s, exists := siteByID[*item.SiteID]; exists {
				targetSite = s
				siteFound = true
			}
		}

		if !siteFound && req.DefaultSiteID != nil && *req.DefaultSiteID > 0 {
			if s, exists := siteByID[*req.DefaultSiteID]; exists {
				targetSite = s
				siteFound = true
			}
		}

		if !siteFound && item.SiteName != "" {
			cleanName := strings.ToLower(strings.TrimSpace(item.SiteName))
			if s, exists := siteByName[cleanName]; exists {
				targetSite = s
				siteFound = true
			}
		}

		if !siteFound && item.PartnerName != "" {
			cleanPartner := strings.ToLower(strings.TrimSpace(item.PartnerName))
			if s, exists := siteByPartner[cleanPartner]; exists {
				targetSite = s
				siteFound = true
			}
		}

		// Fuzzy fallback: check if site_name or partner_name contains search term
		if !siteFound && item.SiteName != "" {
			cleanName := strings.ToLower(strings.TrimSpace(item.SiteName))
			for _, s := range allSites {
				if strings.Contains(strings.ToLower(s.SiteName), cleanName) || strings.Contains(strings.ToLower(s.PartnerName), cleanName) {
					targetSite = s
					siteFound = true
					break
				}
			}
		}

		// Auto-Create Site if not found instead of failing
		if !siteFound {
			siteNameToCreate := strings.TrimSpace(item.SiteName)
			if siteNameToCreate == "" {
				siteNameToCreate = strings.TrimSpace(item.PartnerName)
			}
			if siteNameToCreate == "" {
				if len(allSites) > 0 {
					targetSite = allSites[0]
					siteFound = true
				} else {
					siteNameToCreate = "Site Operasional Lapangan"
				}
			}

			if !siteFound {
				partnerNameToCreate := strings.TrimSpace(item.PartnerName)
				if partnerNameToCreate == "" {
					partnerNameToCreate = siteNameToCreate
				}

				branchForSite := defaultBranchID
				// Try matching branch from branch_code, branch_name, or site_name text
				for _, b := range allBranches {
					if (item.BranchCode != "" && strings.EqualFold(b.Code, item.BranchCode)) ||
					   (item.BranchName != "" && strings.EqualFold(b.Name, item.BranchName)) ||
					   (b.Name != "" && strings.Contains(strings.ToLower(siteNameToCreate), strings.ToLower(b.Name))) ||
					   (b.Code != "" && strings.Contains(strings.ToLower(siteNameToCreate), strings.ToLower(b.Code))) {
						branchForSite = b.ID
						break
					}
				}

				newSite := models.Site{
					BranchID:    branchForSite,
					SiteName:    siteNameToCreate,
					PartnerName: partnerNameToCreate,
					Address:     "Alamat belum diatur (Hasil Auto-Import)",
				}
				if err := config.DB.Create(&newSite).Error; err == nil {
					targetSite = newSite
					siteFound = true
					siteByID[newSite.ID] = newSite
					siteByName[strings.ToLower(strings.TrimSpace(newSite.SiteName))] = newSite
					siteByPartner[strings.ToLower(strings.TrimSpace(newSite.PartnerName))] = newSite
					allSites = append(allSites, newSite)
				}
			}
		}

		if !siteFound {
			importErrors = append(importErrors, ImportErrorDetail{
				RowIndex: rowNumber,
				Brand:    brand,
				Model:    model,
				Error:    fmt.Sprintf("Gagal menetapkan Site untuk baris ini."),
			})
			continue
		}

		// Branch Admin Security Check: Site must belong to their assigned branch
		if role == "Branch Admin" && userBranchID != nil && targetSite.BranchID != *userBranchID {
			importErrors = append(importErrors, ImportErrorDetail{
				RowIndex: rowNumber,
				Brand:    brand,
				Model:    model,
				Error:    fmt.Sprintf("Site '%s' bukan milik cabang yang ditugaskan kepada Anda", targetSite.SiteName),
			})
			continue
		}

		// Auto-generate SN if blank
		if rawSN == "" || rawSN == "-" || strings.EqualFold(rawSN, "n/a") || strings.EqualFold(rawSN, "null") {
			rawSN = fmt.Sprintf("SN-AUTO-%d-%d", targetSite.ID, rowNumber)
		}

		// 2. Resolve Category (Auto-create if new)
		catName := strings.TrimSpace(item.CategoryName)
		if catName == "" {
			catName = "Umum / Lainnya"
		}
		cleanCatName := strings.ToLower(catName)
		catID, catExists := categoryByName[cleanCatName]
		if !catExists {
			newCat := models.Category{Name: catName}
			if err := config.DB.Create(&newCat).Error; err == nil {
				catID = newCat.ID
				categoryByName[cleanCatName] = newCat.ID
			} else {
				// Fallback to first available category
				if len(allCategories) > 0 {
					catID = allCategories[0].ID
				}
			}
		}

		// 3. Resolve Segment (Auto-create if new)
		var segmentIDPtr *uint
		segName := strings.TrimSpace(item.SegmentName)
		if segName != "" {
			cleanSegName := strings.ToLower(segName)
			segID, segExists := segmentByName[cleanSegName]
			if !segExists {
				newSeg := models.Segment{
					Name:  segName,
					Color: "#8b5cf6",
				}
				if err := config.DB.Create(&newSeg).Error; err == nil {
					segID = newSeg.ID
					segmentByName[cleanSegName] = newSeg.ID
					segmentIDPtr = &segID
				}
			} else {
				segmentIDPtr = &segID
			}
		}

		// 4. Clean Serial Numbers & Unit Count
		cleanSN, snCount := cleanSerialNumbers(rawSN)
		unitCount := item.UnitCount
		if unitCount <= 1 && snCount > 1 {
			unitCount = snCount
		}
		if unitCount < 1 {
			unitCount = 1
		}

		// 5. Smart Defaults
		assetType := strings.TrimSpace(item.AssetType)
		if assetType == "" {
			assetType = "Aktif"
		}

		status := strings.TrimSpace(item.Status)
		if status == "" {
			status = "Aktif"
		}

		condition := strings.TrimSpace(item.Condition)
		if condition == "" {
			condition = "Baik"
		}

		ownership := strings.TrimSpace(item.Ownership)
		if ownership == "" {
			ownership = "Aset Tetap"
		}

		locationDetail := strings.TrimSpace(item.LocationDetail)
		if locationDetail == "" {
			locationDetail = "Main Rack"
		}

		notes := strings.TrimSpace(item.Notes)

		newAsset := models.Asset{
			SiteID:         targetSite.ID,
			CategoryID:     catID,
			SegmentID:      segmentIDPtr,
			AssetType:      assetType,
			Brand:          brand,
			Model:          model,
			SerialNumber:   cleanSN,
			LocationDetail: locationDetail,
			UnitCount:      unitCount,
			Status:         status,
			Condition:      condition,
			Ownership:      ownership,
			Notes:          notes,
		}

		if err := config.DB.Create(&newAsset).Error; err != nil {
			importErrors = append(importErrors, ImportErrorDetail{
				RowIndex: rowNumber,
				Brand:    brand,
				Model:    model,
				Error:    fmt.Sprintf("Gagal menyimpan ke database: %v", err),
			})
			continue
		}

		createdAssets = append(createdAssets, newAsset)
	}

	successCount := len(createdAssets)

	// Record Audit Log if any assets were successfully created
	if successCount > 0 {
		auditMsg := fmt.Sprintf("Import Massal: Berhasil menambahkan %d aset dari spreadsheet/CSV (%d baris gagal).", successCount, len(importErrors))
		config.RecordAuditLog(userIDPtr, username, "IMPORT_ASET", auditMsg, c.ClientIP())
	}

	c.JSON(http.StatusOK, gin.H{
		"message":       fmt.Sprintf("Proses import selesai. %d aset berhasil disimpan.", successCount),
		"total_rows":    len(req.Items),
		"success_count": successCount,
		"failed_count":  len(importErrors),
		"errors":        importErrors,
	})
}
