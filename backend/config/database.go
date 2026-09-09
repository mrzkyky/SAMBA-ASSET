package config

import (
	"fmt"
	"log"
	"os"
	"regexp"
	"strconv"
	"strings"
	"time"

	"asset-management-backend/models"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func InitDB() *gorm.DB {
	host := os.Getenv("DB_HOST")
	if host == "" {
		host = "localhost"
	}
	port := os.Getenv("DB_PORT")
	if port == "" {
		port = "5432"
	}
	user := os.Getenv("DB_USER")
	if user == "" {
		user = "postgres"
	}
	password := os.Getenv("DB_PASSWORD")
	if password == "" {
		password = "postgrespassword"
	}
	dbname := os.Getenv("DB_NAME")
	if dbname == "" {
		dbname = "asset_db"
	}

	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=Asia/Jakarta",
		host, user, password, dbname, port)

	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	sqlDB, err := DB.DB()
	if err != nil {
		log.Fatalf("Failed to get DB instance: %v", err)
	}

	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(50)
	sqlDB.SetConnMaxLifetime(time.Hour)

	// AutoMigrate all models
	err = DB.AutoMigrate(
		&models.Branch{},
		&models.Site{},
		&models.Category{},
		&models.Segment{},
		&models.Asset{},
		&models.User{},
		&models.AssetTransfer{},
		&models.AuditLog{},
	)
	if err != nil {
		log.Printf("AutoMigrate warning/error: %v", err)
	}

	// Explicitly widen serial_number column type to TEXT to support unlimited multi-SN strings
	if alterErr := DB.Exec("ALTER TABLE assets ALTER COLUMN serial_number TYPE TEXT;").Error; alterErr != nil {
		log.Printf("Notice on alter serial_number column: %v", alterErr)
	}

	// Explicitly create segments table if not exists
	createSegTable := `
	CREATE TABLE IF NOT EXISTS segments (
		id BIGSERIAL PRIMARY KEY,
		name VARCHAR(100) UNIQUE NOT NULL,
		description VARCHAR(255),
		color VARCHAR(20) DEFAULT '#06b6d4',
		created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
	);`
	if segTableErr := DB.Exec(createSegTable).Error; segTableErr != nil {
		log.Printf("Notice on create segments table: %v", segTableErr)
	}

	// Explicitly ensure segment_id column exists on assets table
	if alterSegErr := DB.Exec("ALTER TABLE assets ADD COLUMN IF NOT EXISTS segment_id BIGINT;").Error; alterSegErr != nil {
		log.Printf("Notice on add segment_id column: %v", alterSegErr)
	}

	// Explicitly ensure asset_type, condition, and ownership columns exist on assets table
	DB.Exec("ALTER TABLE assets ADD COLUMN IF NOT EXISTS asset_type VARCHAR(50) DEFAULT 'Aktif';")
	DB.Exec("ALTER TABLE assets ADD COLUMN IF NOT EXISTS condition VARCHAR(50) DEFAULT 'Baik';")
	DB.Exec("ALTER TABLE assets ADD COLUMN IF NOT EXISTS ownership VARCHAR(50) DEFAULT 'Aset Tetap';")
	DB.Exec("ALTER TABLE assets ALTER COLUMN status TYPE VARCHAR(50);")
	DB.Exec("ALTER TABLE assets ALTER COLUMN location_detail TYPE TEXT;")
	DB.Exec("ALTER TABLE assets ALTER COLUMN brand TYPE VARCHAR(255);")
	DB.Exec("ALTER TABLE assets ALTER COLUMN model TYPE VARCHAR(255);")
	_ = DB.Exec("ALTER TABLE assets DROP CONSTRAINT IF EXISTS assets_status_check;").Error
	_ = DB.Exec("ALTER TABLE assets DROP CONSTRAINT IF EXISTS assets_condition_check;").Error
	_ = DB.Exec("ALTER TABLE assets DROP CONSTRAINT IF EXISTS assets_asset_type_check;").Error
	_ = DB.Exec("ALTER TABLE assets DROP CONSTRAINT IF EXISTS assets_ownership_check;").Error
	DB.Exec("UPDATE assets SET asset_type = 'Aktif' WHERE asset_type IS NULL OR asset_type = '';")
	DB.Exec("UPDATE assets SET condition = 'Baik' WHERE condition IS NULL OR condition = '';")
	DB.Exec("UPDATE assets SET ownership = 'Aset Tetap' WHERE ownership IS NULL OR ownership = '';")

	// Explicitly ensure user verification columns exist and existing seed users are marked verified
	DB.Exec("ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;")
	DB.Exec("ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_otp VARCHAR(10);")
	DB.Exec("ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_expires_at TIMESTAMP WITH TIME ZONE;")
	DB.Exec("UPDATE users SET is_verified = TRUE WHERE is_verified IS NULL OR username IN ('admin', 'admin_brebes', 'auditor');")

	// Non-destructive migrations for asset_transfers (prevent cascade data loss & add snapshots)
	DB.Exec("ALTER TABLE asset_transfers ALTER COLUMN asset_id DROP NOT NULL;")
	DB.Exec("ALTER TABLE asset_transfers ALTER COLUMN from_site_id DROP NOT NULL;")
	DB.Exec("ALTER TABLE asset_transfers ALTER COLUMN to_site_id DROP NOT NULL;")
	DB.Exec("ALTER TABLE asset_transfers DROP CONSTRAINT IF EXISTS asset_transfers_asset_id_fkey;")
	DB.Exec("ALTER TABLE asset_transfers DROP CONSTRAINT IF EXISTS asset_transfers_from_site_id_fkey;")
	DB.Exec("ALTER TABLE asset_transfers DROP CONSTRAINT IF EXISTS asset_transfers_to_site_id_fkey;")
	DB.Exec("ALTER TABLE asset_transfers ADD CONSTRAINT asset_transfers_asset_id_fkey FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE SET NULL;")
	DB.Exec("ALTER TABLE asset_transfers ADD CONSTRAINT asset_transfers_from_site_id_fkey FOREIGN KEY (from_site_id) REFERENCES sites(id) ON DELETE SET NULL;")
	DB.Exec("ALTER TABLE asset_transfers ADD CONSTRAINT asset_transfers_to_site_id_fkey FOREIGN KEY (to_site_id) REFERENCES sites(id) ON DELETE SET NULL;")
	DB.Exec("ALTER TABLE asset_transfers ADD COLUMN IF NOT EXISTS asset_brand VARCHAR(255);")
	DB.Exec("ALTER TABLE asset_transfers ADD COLUMN IF NOT EXISTS asset_model VARCHAR(255);")
	DB.Exec("ALTER TABLE asset_transfers ADD COLUMN IF NOT EXISTS category_name VARCHAR(100);")
	DB.Exec("ALTER TABLE asset_transfers ADD COLUMN IF NOT EXISTS from_site_name VARCHAR(255);")
	DB.Exec("ALTER TABLE asset_transfers ADD COLUMN IF NOT EXISTS from_partner_name VARCHAR(255);")
	DB.Exec("ALTER TABLE asset_transfers ADD COLUMN IF NOT EXISTS from_branch_name VARCHAR(100);")
	DB.Exec("ALTER TABLE asset_transfers ADD COLUMN IF NOT EXISTS to_site_name VARCHAR(255);")
	DB.Exec("ALTER TABLE asset_transfers ADD COLUMN IF NOT EXISTS to_partner_name VARCHAR(255);")
	DB.Exec("ALTER TABLE asset_transfers ADD COLUMN IF NOT EXISTS to_branch_name VARCHAR(100);")

	// Ensure default seeds exist safely
	seedBranchesAndSites()
	seedCategories()
	seedSegments()
	seedUsers()
	autoAssignSegmentsToExistingAssets()
	RecoverTransfersFromAuditLogs()

	log.Println("Database connection established & auto-migrated successfully.")
	return DB
}

func RecordAuditLog(userID *uint, username, action, details, ipAddress string) {
	if username == "" {
		username = "System"
	}
	logEntry := models.AuditLog{
		UserID:    userID,
		Username:  username,
		Action:    action,
		Details:   details,
		IPAddress: ipAddress,
		CreatedAt: time.Now(),
	}
	DB.Create(&logEntry)
}

func seedBranchesAndSites() {
	// Seed branches if none exist
	var branchCount int64
	DB.Model(&models.Branch{}).Count(&branchCount)
	if branchCount == 0 {
		branches := []models.Branch{
			{Code: "BR-BRB", Name: "Branch Brebes", Province: "Jawa Tengah"},
			{Code: "BR-BDG", Name: "Branch Bandung", Province: "Jawa Barat"},
			{Code: "BR-SBY", Name: "Branch Surabaya", Province: "Jawa Timur"},
			{Code: "BR-JKT", Name: "Branch Jakarta Pusat", Province: "DKI Jakarta"},
			{Code: "BR-MDN", Name: "Branch Medan", Province: "Sumatera Utara"},
		}
		for _, b := range branches {
			DB.Create(&b)
		}
		log.Println("Seeded default branches successfully.")
	}

	// Seed sites INDEPENDENTLY — always check, even if branches were already created by init-db.sql
	var siteCount int64
	DB.Model(&models.Site{}).Count(&siteCount)
	if siteCount == 0 {
		var brebesBranch models.Branch
		if err := DB.Where("code = ?", "BR-BRB").First(&brebesBranch).Error; err == nil {
			sites := []models.Site{
				{BranchID: brebesBranch.ID, PartnerName: "MAN 1 Brebes", SiteName: "Site Brebes", Address: "Jl. Yos Sudarso No. 16, Brebes"},
				{BranchID: brebesBranch.ID, PartnerName: "SMA N 1 Brebes", SiteName: "Site Brebes", Address: "Jl. Dr. Setiabudi No. 11, Brebes"},
				{BranchID: brebesBranch.ID, PartnerName: "SMA N 2 Brebes", SiteName: "Site Brebes", Address: "Jl. Jenderal A. Yani No. 77, Brebes"},
			}
			for _, s := range sites {
				DB.Create(&s)
			}
			log.Println("Seeded default sites under Branch Brebes.")
		}
	}
}

func seedCategories() {
	categories := []string{
		"Access Point", "AOC", "Akses Kontrol", "ATN", "Baterai", "CRS",
		"DCDU", "Firewall", "Inline Atenuator", "Inverter", "Kipas Mini",
		"LHG", "MC", "Microwave (ODU, IDU, Kabel)", "MikroTik", "OLT",
		"ONT", "OTB", "Patch Cord", "PSU", "Rack Server", "Rectifier",
		"Router", "RTN", "Server", "SFP", "Step Down / Step Up", "Switch",
		"UPS & Power",
	}

	for _, name := range categories {
		var existing models.Category
		if err := DB.Where("name = ?", name).First(&existing).Error; err != nil {
			c := models.Category{Name: name}
			if createErr := DB.Create(&c).Error; createErr == nil {
				log.Printf("Seeded default category: %s", name)
			}
		}
	}
}

func seedSegments() {
	type segDef struct {
		Name        string
		Description string
		Color       string
	}
	segments := []segDef{
		{Name: "Kemitraan", Description: "Aset perangkat untuk layanan kemitraan/partnership", Color: "#06b6d4"},
		{Name: "POP", Description: "Point of Presence — aset jaringan inti", Color: "#8b5cf6"},
		{Name: "Local Loop", Description: "Aset untuk konektivitas last-mile", Color: "#f59e0b"},
		{Name: "Corporate", Description: "Aset untuk layanan enterprise/korporat", Color: "#10b981"},
	}

	for _, seg := range segments {
		var existing models.Segment
		if err := DB.Where("name = ?", seg.Name).First(&existing).Error; err != nil {
			s := models.Segment{Name: seg.Name, Description: seg.Description, Color: seg.Color}
			if createErr := DB.Create(&s).Error; createErr == nil {
				log.Printf("Seeded default segment: %s", seg.Name)
			}
		}
	}
}

func seedUsers() {
	hashAdmin, _ := bcrypt.GenerateFromPassword([]byte("accessup123"), 14)
	hashBrebes, _ := bcrypt.GenerateFromPassword([]byte("brebes123"), 14)
	hashAuditor, _ := bcrypt.GenerateFromPassword([]byte("auditor123"), 14)

	branchIDBrebes := uint(1)

	defaultUsers := []models.User{
		{
			Username:     "admin",
			Email:        "admin@national-asset.id",
			PasswordHash: string(hashAdmin),
			Role:         "Super Admin",
			BranchID:     nil,
			IsVerified:   true,
		},
		{
			Username:     "admin_brebes",
			Email:        "brebes@national-asset.id",
			PasswordHash: string(hashBrebes),
			Role:         "Branch Admin",
			BranchID:     &branchIDBrebes,
			IsVerified:   true,
		},
		{
			Username:     "auditor",
			Email:        "auditor@national-asset.id",
			PasswordHash: string(hashAuditor),
			Role:         "Auditor",
			BranchID:     nil,
			IsVerified:   true,
		},
	}

	for _, u := range defaultUsers {
		var existing models.User
		if err := DB.Where("username = ?", u.Username).First(&existing).Error; err != nil {
			if createErr := DB.Create(&u).Error; createErr != nil {
				log.Printf("Failed to seed default user %s: %v", u.Username, createErr)
			} else {
				log.Printf("Seeded default user: %s (%s)", u.Username, u.Role)
			}
		} else if u.Username == "admin" {
			// Ensure superadmin password is synchronized to the updated password
			existing.PasswordHash = u.PasswordHash
			existing.IsVerified = true
			DB.Save(&existing)
		}
	}
}

func autoAssignSegmentsToExistingAssets() {
	var unassignedCount int64
	DB.Model(&models.Asset{}).Where("segment_id IS NULL OR segment_id = 0").Count(&unassignedCount)
	if unassignedCount == 0 {
		return
	}

	var segKemitraan, segPOP, segLocalLoop, segCorporate models.Segment
	DB.Where("name = ?", "Kemitraan").First(&segKemitraan)
	DB.Where("name = ?", "POP").First(&segPOP)
	DB.Where("name = ?", "Local Loop").First(&segLocalLoop)
	DB.Where("name = ?", "Corporate").First(&segCorporate)

	if segCorporate.ID == 0 {
		return
	}

	// 1. Assign Access Point, LHG, ONT, Patch Cord, MC to Local Loop / Kemitraan
	if segLocalLoop.ID > 0 {
		DB.Exec(`UPDATE assets SET segment_id = ? WHERE (segment_id IS NULL OR segment_id = 0) AND category_id IN (
			SELECT id FROM categories WHERE LOWER(name) LIKE '%access point%' OR LOWER(name) LIKE '%ont%' OR LOWER(name) LIKE '%lhg%' OR LOWER(name) LIKE '%patch cord%' OR LOWER(name) LIKE '%mc%'
		)`, segLocalLoop.ID)
	}

	// 2. Assign OLT, Router, Switch, Firewall, Microwave, ATN, RTN to POP
	if segPOP.ID > 0 {
		DB.Exec(`UPDATE assets SET segment_id = ? WHERE (segment_id IS NULL OR segment_id = 0) AND category_id IN (
			SELECT id FROM categories WHERE LOWER(name) LIKE '%olt%' OR LOWER(name) LIKE '%router%' OR LOWER(name) LIKE '%firewall%' OR LOWER(name) LIKE '%microwave%' OR LOWER(name) LIKE '%atn%' OR LOWER(name) LIKE '%rtn%'
		)`, segPOP.ID)
	}

	// 3. Assign SFP, AOC, Server, Rack Server, Step Down, UPS to Corporate
	if segCorporate.ID > 0 {
		DB.Exec(`UPDATE assets SET segment_id = ? WHERE (segment_id IS NULL OR segment_id = 0) AND category_id IN (
			SELECT id FROM categories WHERE LOWER(name) LIKE '%sfp%' OR LOWER(name) LIKE '%server%' OR LOWER(name) LIKE '%aoc%' OR LOWER(name) LIKE '%ups%' OR LOWER(name) LIKE '%rack%' OR LOWER(name) LIKE '%step%'
		)`, segCorporate.ID)
	}

	// 4. Any remaining assets set to Corporate or Kemitraan
	if segCorporate.ID > 0 {
		DB.Exec(`UPDATE assets SET segment_id = ? WHERE segment_id IS NULL OR segment_id = 0`, segCorporate.ID)
	}

	log.Printf("Successfully auto-assigned segments to %d existing unclassified assets.", unassignedCount)
}

func RecoverTransfersFromAuditLogs() int {
	var auditLogs []models.AuditLog
	DB.Where("action = ?", "MUTASI_ASET").Order("created_at ASC").Find(&auditLogs)
	if len(auditLogs) == 0 {
		return 0
	}

	// Regex to extract mutation details:
	// "Mutasi %d unit %s %s [%s] dari %s (%s) ke %s (%s) (No. BAST/Ref: %s)"
	re := regexp.MustCompile(`(?i)Mutasi\s+(\d+)\s+unit\s+(.+?)\s*\[(.*?)\]\s+dari\s+(.+?)\s*\((.+?)\)\s+ke\s+(.+?)\s*\((.+?)\)\s*\(No\.\s*BAST/Ref:\s*([^)]+)\)`)

	recoveredCount := 0
	for _, logEntry := range auditLogs {
		matches := re.FindStringSubmatch(logEntry.Details)
		if len(matches) < 9 {
			continue
		}

		unitCountStr := strings.TrimSpace(matches[1])
		deviceDesc := strings.TrimSpace(matches[2])
		sns := strings.TrimSpace(matches[3])
		fromSite := strings.TrimSpace(matches[4])
		fromBranch := strings.TrimSpace(matches[5])
		toSite := strings.TrimSpace(matches[6])
		toBranch := strings.TrimSpace(matches[7])
		refNo := strings.TrimSpace(matches[8])

		// Check if reference_no already exists in asset_transfers
		var existingCount int64
		DB.Model(&models.AssetTransfer{}).Where("reference_no = ?", refNo).Count(&existingCount)
		if existingCount > 0 {
			continue
		}

		unitCount, _ := strconv.Atoi(unitCountStr)
		if unitCount <= 0 {
			unitCount = 1
		}

		// Parse brand & model from deviceDesc
		brand := ""
		model := deviceDesc
		parts := strings.SplitN(deviceDesc, " ", 2)
		if len(parts) == 2 {
			brand = parts[0]
			model = parts[1]
		}

		// Try to find matching asset by Serial Number or Model
		var matchedAsset models.Asset
		var assetIDPtr *uint
		var toSiteIDPtr *uint

		firstSN := strings.Split(sns, ",")[0]
		firstSN = strings.Split(firstSN, "\t")[0]
		firstSN = strings.TrimSpace(firstSN)

		if firstSN != "" && firstSN != "-" && !strings.EqualFold(firstSN, "none") {
			if err := DB.Where("serial_number LIKE ?", "%"+firstSN+"%").First(&matchedAsset).Error; err == nil {
				assetIDPtr = &matchedAsset.ID
				toSiteIDPtr = &matchedAsset.SiteID
			}
		}

		newTransfer := models.AssetTransfer{
			ReferenceNo:       refNo,
			AssetID:           assetIDPtr,
			FromSiteID:        nil,
			ToSiteID:          toSiteIDPtr,
			UnitCount:         unitCount,
			SerialNumbers:     sns,
			TransferDate:      logEntry.CreatedAt,
			Reason:            "Dipulihkan otomatis dari jejak audit mutasi",
			PerformedByUserID: logEntry.UserID,
			AssetBrand:        brand,
			AssetModel:        model,
			FromSiteName:      fromSite,
			FromBranchName:    fromBranch,
			ToSiteName:        toSite,
			ToBranchName:      toBranch,
			CreatedAt:         logEntry.CreatedAt,
		}

		if err := DB.Create(&newTransfer).Error; err == nil {
			recoveredCount++
		}
	}

	if recoveredCount > 0 {
		log.Printf("Successfully auto-recovered %d missing transfer history records from audit logs.", recoveredCount)
	}
	return recoveredCount
}
