package handlers

import (
	"net/http"

	"asset-management-backend/config"
	"asset-management-backend/models"
	"github.com/gin-gonic/gin"
)

// GetSegments returns all service segments
func GetSegments(c *gin.Context) {
	var segments []models.Segment
	if err := config.DB.Order("name ASC").Find(&segments).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data segmen"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": segments})
}

// CreateSegment creates a new service segment
func CreateSegment(c *gin.Context) {
	var input models.Segment
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if input.Color == "" {
		input.Color = "#06b6d4"
	}
	if err := config.DB.Create(&input).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Gagal membuat segmen. Pastikan nama segmen unik."})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "Segmen berhasil dibuat", "data": input})
}

// UpdateSegment updates an existing segment
func UpdateSegment(c *gin.Context) {
	id := c.Param("id")
	var segment models.Segment
	if err := config.DB.First(&segment, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Segmen tidak ditemukan"})
		return
	}

	var input models.Segment
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	segment.Name = input.Name
	segment.Description = input.Description
	if input.Color != "" {
		segment.Color = input.Color
	}

	if err := config.DB.Save(&segment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memperbarui segmen"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Segmen berhasil diperbarui", "data": segment})
}

// DeleteSegment deletes a segment
func DeleteSegment(c *gin.Context) {
	id := c.Param("id")
	// Check if any assets use this segment
	var assetCount int64
	config.DB.Model(&models.Asset{}).Where("segment_id = ?", id).Count(&assetCount)
	if assetCount > 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Tidak dapat menghapus segmen yang masih digunakan oleh aset"})
		return
	}
	if err := config.DB.Delete(&models.Segment{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus segmen"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Segmen berhasil dihapus"})
}
