package handlers

import (
	"net/http"

	"asset-management-backend/config"
	"asset-management-backend/models"
	"github.com/gin-gonic/gin"
)

// GetDashboardStats returns dashboard key performance indicators
func GetDashboardStats(c *gin.Context) {
	var stats models.StatsResponse

	config.DB.Model(&models.Branch{}).Count(&stats.TotalBranches)
	config.DB.Model(&models.Site{}).Count(&stats.TotalSites)
	config.DB.Model(&models.Category{}).Count(&stats.TotalCategories)
	config.DB.Model(&models.Asset{}).Count(&stats.TotalAssets)

	// Sum unit counts
	var unitSum struct {
		TotalUnits int64
	}
	config.DB.Model(&models.Asset{}).Select("COALESCE(SUM(unit_count), 0) as total_units").Scan(&unitSum)
	stats.TotalUnits = unitSum.TotalUnits

	config.DB.Model(&models.Asset{}).Where("status = ?", "Aktif").Count(&stats.ActiveAssets)
	config.DB.Model(&models.Asset{}).Where("status = ?", "Rusak").Count(&stats.DamagedAssets)
	config.DB.Model(&models.Asset{}).Where("status = ?", "Cadangan").Count(&stats.BackupAssets)

	c.JSON(http.StatusOK, gin.H{"data": stats})
}

// GetHierarchyTree returns structured 4-level hierarchy data for frontend render
func GetHierarchyTree(c *gin.Context) {
	branchID := c.Query("branch_id")

	var branches []models.Branch
	query := config.DB.Order("name ASC")
	if branchID != "" {
		query = query.Where("id = ?", branchID)
	}

	if err := query.Find(&branches).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil hirarki cabang"})
		return
	}

	// Fetch all categories
	var categories []models.Category
	config.DB.Order("name ASC").Find(&categories)

	result := make([]models.BranchHierarchyDTO, 0)

	for _, branch := range branches {
		var sites []models.Site
		config.DB.Where("branch_id = ?", branch.ID).Order("partner_name ASC, site_name ASC").Find(&sites)

		siteGroups := make([]models.SiteGroupDTO, 0)

		for _, site := range sites {
			categoryGroups := make([]models.CategoryGroupDTO, 0)

			for _, cat := range categories {
				var assets []models.Asset
				config.DB.Preload("Segment").Where("site_id = ? AND category_id = ?", site.ID, cat.ID).
					Order("brand ASC, model ASC").
					Find(&assets)

				// Only add category group if it has assets
				if len(assets) > 0 {
					categoryGroups = append(categoryGroups, models.CategoryGroupDTO{
						Category: cat,
						Assets:   assets,
					})
				}
			}

			siteGroups = append(siteGroups, models.SiteGroupDTO{
				Site:           site,
				CategoryGroups: categoryGroups,
			})
		}

		result = append(result, models.BranchHierarchyDTO{
			Branch:     branch,
			SiteGroups: siteGroups,
		})
	}

	c.JSON(http.StatusOK, gin.H{"data": result})
}
