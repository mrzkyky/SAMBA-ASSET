package handlers

import (
	"net/http"
	"strings"

	"asset-management-backend/config"
	"asset-management-backend/models"
	"github.com/gin-gonic/gin"
)

// GetDashboardStats returns dashboard key performance indicators (filtered by branch_id if specified)
func GetDashboardStats(c *gin.Context) {
	branchID := strings.TrimSpace(c.Query("branch_id"))
	var stats models.StatsResponse

	if branchID != "" {
		// Specific Branch Stats
		config.DB.Model(&models.Branch{}).Where("id = ?", branchID).Count(&stats.TotalBranches)
		config.DB.Model(&models.Site{}).Where("branch_id = ?", branchID).Count(&stats.TotalSites)

		// Distinct categories that have assets in this branch
		config.DB.Model(&models.Asset{}).
			Joins("JOIN sites ON sites.id = assets.site_id").
			Where("sites.branch_id = ?", branchID).
			Distinct("assets.category_id").
			Count(&stats.TotalCategories)

		// Total asset records
		config.DB.Model(&models.Asset{}).
			Joins("JOIN sites ON sites.id = assets.site_id").
			Where("sites.branch_id = ?", branchID).
			Count(&stats.TotalAssets)

		// Sum unit counts
		var unitSum struct {
			TotalUnits int64
		}
		config.DB.Model(&models.Asset{}).
			Joins("JOIN sites ON sites.id = assets.site_id").
			Where("sites.branch_id = ?", branchID).
			Select("COALESCE(SUM(assets.unit_count), 0) as total_units").
			Scan(&unitSum)
		stats.TotalUnits = unitSum.TotalUnits

		// Status breakdown
		config.DB.Model(&models.Asset{}).
			Joins("JOIN sites ON sites.id = assets.site_id").
			Where("sites.branch_id = ? AND assets.status = ?", branchID, "Aktif").
			Count(&stats.ActiveAssets)

		config.DB.Model(&models.Asset{}).
			Joins("JOIN sites ON sites.id = assets.site_id").
			Where("sites.branch_id = ? AND (assets.status = 'Nonaktif' OR assets.asset_type = 'Pasif' OR assets.status = 'Pasif')", branchID).
			Count(&stats.PassiveAssets)

		config.DB.Model(&models.Asset{}).
			Joins("JOIN sites ON sites.id = assets.site_id").
			Where("sites.branch_id = ? AND (assets.status = 'Rusak' OR assets.condition = 'Rusak')", branchID).
			Count(&stats.DamagedAssets)

		config.DB.Model(&models.Asset{}).
			Joins("JOIN sites ON sites.id = assets.site_id").
			Where("sites.branch_id = ? AND (assets.status = 'Maintenance' OR assets.condition = 'Perlu Perbaikan' OR assets.status = 'Cadangan')", branchID).
			Count(&stats.BackupAssets)
	} else {
		// All Branches (National)
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
		config.DB.Model(&models.Asset{}).Where("status = 'Nonaktif' OR asset_type = 'Pasif' OR status = 'Pasif'").Count(&stats.PassiveAssets)
		config.DB.Model(&models.Asset{}).Where("status = 'Rusak' OR condition = 'Rusak'").Count(&stats.DamagedAssets)
		config.DB.Model(&models.Asset{}).Where("status = 'Maintenance' OR condition = 'Perlu Perbaikan' OR status = 'Cadangan'").Count(&stats.BackupAssets)
	}

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
