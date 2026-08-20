package main

import (
	"log"
	"os"

	"asset-management-backend/config"
	"asset-management-backend/routes"
)

func main() {
	// Initialize Database Connection Pool
	config.InitDB()

	// Setup Router
	r := routes.SetupRouter()

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Starting National Asset Management Backend Server on port %s...", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Server failed to run: %v", err)
	}
}
