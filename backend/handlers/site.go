package handlers

import (
	"net/http"

	"asset-management-backend/config"
	"asset-management-backend/models"
	"github.com/gin-gonic/gin"
)

// GetSites returns sites, optionally filtered by branch_id
func GetSites(c *gin.Context) {
	branchID := c.Query("branch_id")
	var sites []models.Site

	query := config.DB.Preload("Branch").Order("site_name ASC")
	if branchID != "" {
		query = query.Where("branch_id = ?", branchID)
	}

	if err := query.Find(&sites).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data mitra/site"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": sites})
}

// CreateSite creates a new site/mitra under a branch
func CreateSite(c *gin.Context) {
	var input models.Site
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := config.DB.Create(&input).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Gagal membuat site"})
		return
	}

	config.DB.Preload("Branch").First(&input, input.ID)
	c.JSON(http.StatusCreated, gin.H{"message": "Site berhasil ditambahkan", "data": input})
}

// UpdateSite updates an existing site
func UpdateSite(c *gin.Context) {
	id := c.Param("id")
	var site models.Site
	if err := config.DB.First(&site, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Site tidak ditemukan"})
		return
	}

	var input models.Site
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	site.BranchID = input.BranchID
	site.PartnerName = input.PartnerName
	site.SiteName = input.SiteName
	site.Address = input.Address

	if err := config.DB.Save(&site).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memperbarui site"})
		return
	}

	config.DB.Preload("Branch").First(&site, site.ID)
	c.JSON(http.StatusOK, gin.H{"message": "Site berhasil diperbarui", "data": site})
}

// DeleteSite deletes a site
func DeleteSite(c *gin.Context) {
	id := c.Param("id")
	if err := config.DB.Delete(&models.Site{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus site"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Site berhasil dihapus"})
}
