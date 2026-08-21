package routes

import (
	"asset-management-backend/handlers"
	"asset-management-backend/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRouter() *gin.Engine {
	r := gin.Default()

	// CORS Middleware
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(24)
			return
		}
		c.Next()
	})

	api := r.Group("/api")
	{
		// Auth Public Routes
		api.POST("/auth/login", handlers.Login)

		// Public Stats Endpoint
		api.GET("/stats", handlers.GetDashboardStats)

		// Protected Routes (Require Valid JWT Token)
		protected := api.Group("")
		protected.Use(middleware.JWTAuthMiddleware())
		{
			// Auth Profile
			protected.GET("/auth/me", handlers.GetProfile)

			// Hierarchy View
			protected.GET("/hierarchy", handlers.GetHierarchyTree)

			// Branch CRUD (Super Admin Only)
			branches := protected.Group("/branches")
			{
				branches.GET("", handlers.GetBranches)
				branches.GET("/:id", handlers.GetBranchByID)
				branches.POST("", middleware.RequireRoles("Super Admin"), handlers.CreateBranch)
				branches.PUT("/:id", middleware.RequireRoles("Super Admin"), handlers.UpdateBranch)
				branches.DELETE("/:id", middleware.RequireRoles("Super Admin"), handlers.DeleteBranch)
			}

			// Site CRUD
			sites := protected.Group("/sites")
			{
				sites.GET("", handlers.GetSites)
				sites.POST("", middleware.RequireRoles("Super Admin", "Branch Admin"), handlers.CreateSite)
				sites.PUT("/:id", middleware.RequireRoles("Super Admin", "Branch Admin"), handlers.UpdateSite)
				sites.DELETE("/:id", middleware.RequireRoles("Super Admin", "Branch Admin"), handlers.DeleteSite)
			}

			// Category CRUD
			categories := protected.Group("/categories")
			{
				categories.GET("", handlers.GetCategories)
				categories.POST("", middleware.RequireRoles("Super Admin", "Branch Admin"), handlers.CreateCategory)
				categories.PUT("/:id", middleware.RequireRoles("Super Admin", "Branch Admin"), handlers.UpdateCategory)
				categories.DELETE("/:id", middleware.RequireRoles("Super Admin", "Branch Admin"), handlers.DeleteCategory)
			}

			// Asset CRUD
			assets := protected.Group("/assets")
			{
				assets.GET("", handlers.GetAssets)
				assets.GET("/export", handlers.ExportAssets)
				assets.GET("/:id", handlers.GetAssetByID)
				assets.POST("", middleware.RequireRoles("Super Admin", "Branch Admin"), handlers.CreateAsset)
				assets.PUT("/:id", middleware.RequireRoles("Super Admin", "Branch Admin"), handlers.UpdateAsset)
				assets.DELETE("/:id", middleware.RequireRoles("Super Admin", "Branch Admin"), handlers.DeleteAsset)
			}

			// Asset Transfer & Mutation Routes
			transfers := protected.Group("/transfers")
			{
				transfers.GET("", handlers.GetTransfers)
				transfers.POST("", middleware.RequireRoles("Super Admin", "Branch Admin"), handlers.CreateTransfer)
			}

			// System Audit Trail Logs Route
			protected.GET("/audit-logs", middleware.RequireRoles("Super Admin"), handlers.GetAuditLogs)

			// User Management Routes (Super Admin Only)
			users := protected.Group("/users")
			users.Use(middleware.RequireRoles("Super Admin"))
			{
				users.GET("", handlers.GetUsers)
				users.POST("", handlers.CreateUser)
				users.PUT("/:id", handlers.UpdateUser)
				users.DELETE("/:id", handlers.DeleteUser)
			}
		}
	}

	return r
}
