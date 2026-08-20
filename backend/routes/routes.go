package routes

import (
	"asset-management-backend/handlers"
	"asset-management-backend/middleware"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func SetupRouter() *gin.Engine {
	r := gin.Default()

	// Enable CORS
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
		// Public Auth Endpoint
		api.POST("/auth/login", handlers.Login)

		// Public Data Endpoints for UI viewing (or protected)
		api.GET("/dashboard/stats", handlers.GetDashboardStats)
		api.GET("/hierarchy", handlers.GetHierarchyTree)
		api.GET("/branches", handlers.GetBranches)
		api.GET("/sites", handlers.GetSites)
		api.GET("/categories", handlers.GetCategories)
		api.GET("/assets", handlers.GetAssets)
		api.GET("/assets/export", handlers.ExportAssets)
		api.GET("/assets/:id", handlers.GetAssetByID)

		// Authenticated Routes (Requires Bearer JWT Token)
		authRoutes := api.Group("")
		authRoutes.Use(middleware.JWTAuthMiddleware())
		{
			authRoutes.GET("/auth/profile", handlers.GetProfile)

			// Super Admin & Branch Admin can perform CRUD on assets, branches, sites, categories
			writeRoutes := authRoutes.Group("")
			writeRoutes.Use(middleware.RequireRoles("Super Admin", "Branch Admin"))
			{
				writeRoutes.POST("/branches", handlers.CreateBranch)
				writeRoutes.PUT("/branches/:id", handlers.UpdateBranch)
				writeRoutes.DELETE("/branches/:id", handlers.DeleteBranch)

				writeRoutes.POST("/sites", handlers.CreateSite)
				writeRoutes.PUT("/sites/:id", handlers.UpdateSite)
				writeRoutes.DELETE("/sites/:id", handlers.DeleteSite)

				writeRoutes.POST("/categories", handlers.CreateCategory)
				writeRoutes.PUT("/categories/:id", handlers.UpdateCategory)
				writeRoutes.DELETE("/categories/:id", handlers.DeleteCategory)

				writeRoutes.POST("/assets", handlers.CreateAsset)
				writeRoutes.PUT("/assets/:id", handlers.UpdateAsset)
				writeRoutes.DELETE("/assets/:id", handlers.DeleteAsset)
			}

			// Super Admin Only: User Management CRUD
			adminRoutes := authRoutes.Group("")
			adminRoutes.Use(middleware.RequireRoles("Super Admin"))
			{
				adminRoutes.GET("/users", handlers.GetUsers)
				adminRoutes.POST("/users", handlers.CreateUser)
				adminRoutes.PUT("/users/:id", handlers.UpdateUser)
				adminRoutes.DELETE("/users/:id", handlers.DeleteUser)
			}
		}
	}

	return r
}
