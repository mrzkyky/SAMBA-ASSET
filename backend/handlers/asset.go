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

	// Global Search Query (Serial Number, Brand, Model, Location, Notes, Site, Branch, Category, Segment)
	search := strings.TrimSpace(c.Query("q"))
	if search != "" {
		searchPattern := "%" + strings.ToLower(search) + "%"
		query = query.Joins("LEFT JOIN sites ON sites.id = assets.site_id").
			Joins("LEFT JOIN branches ON branches.id = sites.branch_id").
			Joins("LEFT JOIN categories ON categories.id = assets.category_id").
			Joins("LEFT JOIN segments ON segments.id = assets.segment_id").
			Where(
				"LOWER(assets.serial_number) LIKE ? OR LOWER(assets.brand) LIKE ? OR LOWER(assets.model) LIKE ? OR LOWER(assets.location_detail) LIKE ? OR LOWER(assets.notes) LIKE ? OR LOWER(sites.site_name) LIKE ? OR LOWER(sites.partner_name) LIKE ? OR LOWER(branches.name) LIKE ? OR LOWER(branches.code) LIKE ? OR LOWER(categories.name) LIKE ? OR LOWER(segments.name) LIKE ?",
				searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern,
			)
	}

	// Filter by Branch
	branchID := c.Query("branch_id")
	if branchID != "" {
		query = query.Joins("JOIN sites ON sites.id = assets.site_id").
			Where("sites.branch_id = ?", branchID)
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

	// Filter by Status
	status := c.Query("status")
	if status != "" {
		query = query.Where("assets.status = ?", status)
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
	validSorts := map[string]bool{"id": true, "brand": true, "model": true, "serial_number": true, "status": true, "unit_count": true, "created_at": true}
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

	if input.Status == "" {
		input.Status = "Aktif"
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
	c.JSON(http.StatusCreated, gin.H{"message": "Aset berhasil ditambahkan", "data": input})
}

// UpdateAsset updates an existing asset
func UpdateAsset(c *gin.Context) {
	id := c.Param("id")
	var asset models.Asset
	if err := config.DB.First(&asset, id).Error; err != nil {
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

	updateMap := map[string]interface{}{
		"site_id":         input.SiteID,
		"category_id":     input.CategoryID,
		"segment_id":      input.SegmentID,
		"brand":           input.Brand,
		"model":           input.Model,
		"serial_number":   cleanSN,
		"location_detail": input.LocationDetail,
		"unit_count":      finalUnitCount,
		"status":          input.Status,
		"notes":           input.Notes,
	}

	if err := config.DB.Model(&models.Asset{}).Where("id = ?", asset.ID).Updates(updateMap).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Gagal memperbarui aset: %v", err)})
		return
	}

	config.DB.Preload("Site.Branch").Preload("Category").Preload("Segment").First(&asset, asset.ID)
	c.JSON(http.StatusOK, gin.H{"message": "Aset berhasil diperbarui", "data": asset})
}

// DeleteAsset deletes an asset
func DeleteAsset(c *gin.Context) {
	id := c.Param("id")
	if err := config.DB.Delete(&models.Asset{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus aset"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Aset berhasil dihapus"})
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

	var assets []models.Asset
	if err := query.Order("assets.id ASC").Find(&assets).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data untuk ekspor"})
		return
	}

	b := &bytes.Buffer{}
	w := csv.NewWriter(b)

	header := []string{
		"ID", "Kode Cabang", "Nama Cabang", "Mitra / Partner", "Nama Site",
		"Kategori", "Merek", "Tipe / Model", "Serial Number",
		"Lokasi Detail / Rak", "Jumlah Unit", "Status", "Catatan",
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

		record := []string{
			fmt.Sprintf("%d", a.ID),
			branchCode,
			branchName,
			partnerName,
			siteName,
			categoryName,
			a.Brand,
			a.Model,
			a.SerialNumber,
			a.LocationDetail,
			fmt.Sprintf("%d", a.UnitCount),
			a.Status,
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
