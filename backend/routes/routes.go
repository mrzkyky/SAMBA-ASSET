package routes

import (
	"asset-management-backend/handlers"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func SetupRouter() *gin.Engine {
	r := gin.Default()

	// Enable CORS for frontend integration
	corsConfig := cors.DefaultConfig()
	corsConfig.AllowAllOrigins = true
	corsConfig.AllowHeaders = []string{"Origin", "Content-Type", "Accept", "Authorization"}
	corsConfig.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	r.Use(cors.New(corsConfig))

	// Health Check
	r.GET("/api/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "UP", "message": "National Asset Management System API is operational"})
	})

	api := r.Group("/api")
	{
		// Stats & Hierarchy
		api.GET("/dashboard/stats", handlers.GetDashboardStats)
		api.GET("/hierarchy", handlers.GetHierarchyTree)

		// Branch Endpoints
		api.GET("/branches", handlers.GetBranches)
		api.GET("/branches/:id", handlers.GetBranchByID)
		api.POST("/branches", handlers.CreateBranch)
		api.PUT("/branches/:id", handlers.UpdateBranch)
		api.DELETE("/branches/:id", handlers.DeleteBranch)

		// Site Endpoints
		api.GET("/sites", handlers.GetSites)
		api.POST("/sites", handlers.CreateSite)
		api.PUT("/sites/:id", handlers.UpdateSite)
		api.DELETE("/sites/:id", handlers.DeleteSite)

		// Category Endpoints
		api.GET("/categories", handlers.GetCategories)
		api.POST("/categories", handlers.CreateCategory)
		api.PUT("/categories/:id", handlers.UpdateCategory)
		api.DELETE("/categories/:id", handlers.DeleteCategory)

		// Asset Endpoints
		api.GET("/assets", handlers.GetAssets)
		api.GET("/assets/export", handlers.ExportAssets)
		api.GET("/assets/:id", handlers.GetAssetByID)
		api.POST("/assets", handlers.CreateAsset)
		api.PUT("/assets/:id", handlers.UpdateAsset)
		api.DELETE("/assets/:id", handlers.DeleteAsset)
	}

	return r
}
