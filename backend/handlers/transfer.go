package handlers

import (
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"asset-management-backend/config"
	"asset-management-backend/models"
	"github.com/gin-gonic/gin"
)

// CreateTransfer handles asset mutation/transfer from one site to another
func CreateTransfer(c *gin.Context) {
	var input models.CreateTransferRequest
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var sourceAsset models.Asset
	if err := config.DB.Preload("Site.Branch").Preload("Category").First(&sourceAsset, input.AssetID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Aset sumber tidak ditemukan"})
		return
	}

	if sourceAsset.SiteID == input.ToSiteID {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Site tujuan harus berbeda dengan site asal"})
		return
	}

	var destSite models.Site
	if err := config.DB.Preload("Branch").First(&destSite, input.ToSiteID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Site tujuan tidak ditemukan"})
		return
	}

	if input.UnitCount <= 0 || input.UnitCount > sourceAsset.UnitCount {
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Jumlah unit mutasi tidak valid (Maksimal %d unit)", sourceAsset.UnitCount)})
		return
	}

	// Generate Reference Number MUT/YYYY/MM/XXXX
	refNo := fmt.Sprintf("MUT/%s/%04d", time.Now().Format("2006/01"), time.Now().Unix()%10000)

	// Clean & format serial numbers to move
	transferredSNs := strings.TrimSpace(input.SerialNumbers)
	if transferredSNs == "" {
		transferredSNs = sourceAsset.SerialNumber
	}

	// Get authenticated user ID & Username
	userIDVal, _ := c.Get("user_id")
	usernameVal, _ := c.Get("username")
	var userIDPtr *uint
	username := "System"
	if uid, ok := userIDVal.(uint); ok {
		userIDPtr = &uid
	}
	if uname, ok := usernameVal.(string); ok && uname != "" {
		username = uname
	}

	// Create Transfer Record
	transferRecord := models.AssetTransfer{
		ReferenceNo:        refNo,
		AssetID:            sourceAsset.ID,
		FromSiteID:         sourceAsset.SiteID,
		ToSiteID:           input.ToSiteID,
		UnitCount:          input.UnitCount,
		SerialNumbers:      transferredSNs,
		TransferDate:       time.Now(),
		Reason:             input.Reason,
		PerformedByUserID: userIDPtr,
	}

	if err := config.DB.Create(&transferRecord).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mencatat mutasi perangkat"})
		return
	}

	// Process Asset Quantity / Site updates
	if input.UnitCount >= sourceAsset.UnitCount {
		// Entire asset record is moved to destination site
		updateMap := map[string]interface{}{
			"site_id": input.ToSiteID,
		}
		if transferredSNs != "" {
			updateMap["serial_number"] = transferredSNs
		}
		if err := config.DB.Model(&models.Asset{}).Where("id = ?", sourceAsset.ID).Updates(updateMap).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memindahkan lokasi aset di database"})
			return
		}
	} else {
		// Partial transfer: Reduce unit_count of source asset
		newCount := sourceAsset.UnitCount - input.UnitCount
		if err := config.DB.Model(&models.Asset{}).Where("id = ?", sourceAsset.ID).Update("unit_count", newCount).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memperbarui jumlah unit aset asal"})
			return
		}

		// Create a new asset record at destination site for transferred units
		newDestAsset := models.Asset{
			SiteID:         input.ToSiteID,
			CategoryID:     sourceAsset.CategoryID,
			SegmentID:      sourceAsset.SegmentID,
			Brand:          sourceAsset.Brand,
			Model:          sourceAsset.Model,
			SerialNumber:   transferredSNs,
			LocationDetail: sourceAsset.LocationDetail,
			UnitCount:      input.UnitCount,
			Status:         sourceAsset.Status,
			Notes:          fmt.Sprintf("Hasil mutasi dari %s (%s). Catatan: %s", sourceAsset.Site.SiteName, refNo, input.Reason),
		}
		if err := config.DB.Create(&newDestAsset).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membuat aset baru di site tujuan"})
			return
		}
	}

	// Record Audit Log
	fromSiteName := fmt.Sprintf("%s (%s)", sourceAsset.Site.SiteName, sourceAsset.Site.Branch.Name)
	toSiteName := fmt.Sprintf("%s (%s)", destSite.SiteName, destSite.Branch.Name)
	auditDetails := fmt.Sprintf("Mutasi %d unit %s %s [%s] dari %s ke %s (No. BAST/Ref: %s)",
		input.UnitCount, sourceAsset.Brand, sourceAsset.Model, transferredSNs, fromSiteName, toSiteName, refNo)

	config.RecordAuditLog(userIDPtr, username, "MUTASI_ASET", auditDetails, c.ClientIP())

	// Return created transfer record preloaded
	config.DB.Preload("Asset.Category").Preload("FromSite.Branch").Preload("ToSite.Branch").Preload("PerformedByUser").First(&transferRecord, transferRecord.ID)
	c.JSON(http.StatusCreated, gin.H{
		"message": "Mutasi perangkat berhasil dilakukan",
		"data":    transferRecord,
	})
}

// GetTransfers returns transfer history list
func GetTransfers(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}
	offset := (page - 1) * limit

	query := config.DB.Model(&models.AssetTransfer{}).
		Preload("Asset.Category").
		Preload("FromSite.Branch").
		Preload("ToSite.Branch").
		Preload("PerformedByUser")

	var total int64
	query.Count(&total)

	var transfers []models.AssetTransfer
	if err := query.Order("asset_transfers.created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&transfers).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil histori mutasi"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":        transfers,
		"total":       total,
		"page":        page,
		"limit":       limit,
		"total_pages": (total + int64(limit) - 1) / int64(limit),
	})
}
