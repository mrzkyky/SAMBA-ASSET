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
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	api := r.Group("/api")
	{
		// Auth Public Routes
		api.POST("/auth/login", handlers.Login)
		api.POST("/auth/register", handlers.Register)
		api.POST("/auth/verify-email", handlers.VerifyEmail)
		api.POST("/auth/resend-otp", handlers.ResendOTP)

		// Public Stats Endpoint
		api.GET("/stats", handlers.GetDashboardStats)

		// Public Health Check (for debugging database state)
		api.GET("/health", handlers.HealthCheck)

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

			// Segment CRUD (Kemitraan, POP, Local Loop, Corporate)
			segments := protected.Group("/segments")
			{
				segments.GET("", handlers.GetSegments)
				segments.POST("", middleware.RequireRoles("Super Admin", "Branch Admin"), handlers.CreateSegment)
				segments.PUT("/:id", middleware.RequireRoles("Super Admin"), handlers.UpdateSegment)
				segments.DELETE("/:id", middleware.RequireRoles("Super Admin"), handlers.DeleteSegment)
			}

			// Asset CRUD
			assets := protected.Group("/assets")
			{
				assets.GET("", handlers.GetAssets)
				assets.GET("/missing-sn-sites", handlers.GetMissingSNSites)
				assets.GET("/export", handlers.ExportAssets)
				assets.GET("/buildings", handlers.GetBuildingsBySite)
				assets.GET("/:id", handlers.GetAssetByID)
				assets.POST("", middleware.RequireRoles("Super Admin", "Branch Admin"), handlers.CreateAsset)
				assets.POST("/import", middleware.RequireRoles("Super Admin", "Branch Admin"), handlers.ImportAssets)
				assets.POST("/sync-sheet", middleware.RequireRoles("Super Admin", "Branch Admin"), handlers.SyncAssetsToGoogleSheetHandler)
				assets.PUT("/:id", middleware.RequireRoles("Super Admin", "Branch Admin"), handlers.UpdateAsset)
				assets.DELETE("/:id", middleware.RequireRoles("Super Admin", "Branch Admin"), handlers.DeleteAsset)
			}

			// Asset Transfer & Mutation Routes
			transfers := protected.Group("/transfers")
			{
				transfers.GET("", handlers.GetTransfers)
				transfers.POST("", middleware.RequireRoles("Super Admin", "Branch Admin"), handlers.CreateTransfer)
				transfers.POST("/batch", middleware.RequireRoles("Super Admin", "Branch Admin"), handlers.CreateBatchTransfer)
				transfers.POST("/recover", middleware.RequireRoles("Super Admin"), handlers.RecoverTransfers)
			}

			// System Audit Trail Logs Route (Super Admin & Branch Admin)
			protected.GET("/audit-logs", middleware.RequireRoles("Super Admin", "Branch Admin"), handlers.GetAuditLogs)

			// User Management Routes (Super User Only - Restricted to system creator/owner)
			users := protected.Group("/users")
			users.Use(middleware.RequireRoles("Super User"))
			{
				users.GET("", handlers.GetUsers)
				users.POST("", handlers.CreateUser)
				users.PUT("/:id", handlers.UpdateUser)
				users.DELETE("/:id", handlers.DeleteUser)
			}

			// Internal Office Units Routes (Kantor Pusat, Cabang Utama, Sub-Branch / Unit Kantor)
			officeUnits := protected.Group("/office-units")
			{
				officeUnits.GET("", handlers.GetOfficeUnits)
				officeUnits.POST("", middleware.RequireRoles("Super Admin", "Branch Admin"), handlers.CreateOfficeUnit)
				officeUnits.PUT("/:id", middleware.RequireRoles("Super Admin", "Branch Admin"), handlers.UpdateOfficeUnit)
				officeUnits.DELETE("/:id", middleware.RequireRoles("Super Admin", "Branch Admin"), handlers.DeleteOfficeUnit)
			}

			// Internal Company Office Assets & Branch Infrastructure Routes
			officeAssets := protected.Group("/office-assets")
			{
				officeAssets.GET("", handlers.GetOfficeAssets)
				officeAssets.GET("/stats", handlers.GetOfficeStats)
				officeAssets.GET("/hierarchy", handlers.GetOfficeHierarchy)
				officeAssets.GET("/:id", handlers.GetOfficeAssetByID)
				officeAssets.POST("", middleware.RequireRoles("Super Admin", "Branch Admin"), handlers.CreateOfficeAsset)
				officeAssets.PUT("/:id", middleware.RequireRoles("Super Admin", "Branch Admin"), handlers.UpdateOfficeAsset)
				officeAssets.DELETE("/:id", middleware.RequireRoles("Super Admin", "Branch Admin"), handlers.DeleteOfficeAsset)
			}
		}
	}

	return r
}
