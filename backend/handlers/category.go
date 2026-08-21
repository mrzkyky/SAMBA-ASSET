package handlers

import (
	"net/http"
	"strings"

	"asset-management-backend/config"
	"asset-management-backend/models"
	"github.com/gin-gonic/gin"
)

// GetCategories returns all asset categories
func GetCategories(c *gin.Context) {
	var categories []models.Category
	if err := config.DB.Order("name ASC").Find(&categories).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data kategori"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": categories})
}

// CreateCategory creates a new category (or returns existing if name already exists)
func CreateCategory(c *gin.Context) {
	var input models.Category
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	trimmedName := strings.TrimSpace(input.Name)
	if trimmedName == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Nama kategori tidak boleh kosong"})
		return
	}

	// Check if category already exists (case-insensitive)
	var existing models.Category
	if err := config.DB.Where("LOWER(name) = ?", strings.ToLower(trimmedName)).First(&existing).Error; err == nil {
		c.JSON(http.StatusOK, gin.H{"message": "Kategori sudah ada", "data": existing})
		return
	}

	input.Name = trimmedName
	if err := config.DB.Create(&input).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Gagal membuat kategori."})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "Kategori berhasil ditambahkan", "data": input})
}

// UpdateCategory updates an existing category
func UpdateCategory(c *gin.Context) {
	id := c.Param("id")
	var category models.Category
	if err := config.DB.First(&category, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Kategori tidak ditemukan"})
		return
	}

	var input models.Category
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	category.Name = input.Name

	if err := config.DB.Save(&category).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memperbarui kategori"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Kategori berhasil diperbarui", "data": category})
}

// DeleteCategory deletes a category
func DeleteCategory(c *gin.Context) {
	id := c.Param("id")
	if err := config.DB.Delete(&models.Category{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus kategori. Pastikan tidak ada aset terkait."})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Kategori berhasil dihapus"})
}
