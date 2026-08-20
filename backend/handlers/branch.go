package handlers

import (
	"net/http"

	"asset-management-backend/config"
	"asset-management-backend/models"
	"github.com/gin-gonic/gin"
)

// GetBranches returns list of all branches with site counts
func GetBranches(c *gin.Context) {
	var branches []models.Branch
	if err := config.DB.Order("name ASC").Preload("Sites").Find(&branches).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data cabang"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": branches})
}

// GetBranchByID returns details of a specific branch
func GetBranchByID(c *gin.Context) {
	id := c.Param("id")
	var branch models.Branch
	if err := config.DB.Preload("Sites.Assets").First(&branch, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Cabang tidak ditemukan"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": branch})
}

// CreateBranch creates a new branch
func CreateBranch(c *gin.Context) {
	var input models.Branch
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := config.DB.Create(&input).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Gagal membuat cabang. Pastikan kode unik."})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "Cabang berhasil ditambahkan", "data": input})
}

// UpdateBranch updates an existing branch
func UpdateBranch(c *gin.Context) {
	id := c.Param("id")
	var branch models.Branch
	if err := config.DB.First(&branch, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Cabang tidak ditemukan"})
		return
	}

	var input models.Branch
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	branch.Code = input.Code
	branch.Name = input.Name
	branch.Province = input.Province

	if err := config.DB.Save(&branch).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memperbarui cabang"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Cabang berhasil diperbarui", "data": branch})
}

// DeleteBranch deletes a branch
func DeleteBranch(c *gin.Context) {
	id := c.Param("id")
	if err := config.DB.Delete(&models.Branch{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus cabang"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Cabang berhasil dihapus"})
}
