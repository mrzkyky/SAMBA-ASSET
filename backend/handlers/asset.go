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
