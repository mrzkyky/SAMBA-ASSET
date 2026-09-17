package handlers

import (
	"net/http"
	"strconv"
	"strings"

	"asset-management-backend/config"
	"asset-management-backend/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// =========================================================================
// 1. OFFICE UNIT HANDLERS (Pusat, Cabang Utama, Sub-Branch / Kantor Unit)
// =========================================================================

// GetOfficeUnits returns list of internal company office units, optionally filtered by branch_id
func GetOfficeUnits(c *gin.Context) {
	branchID := c.Query("branch_id")
	unitType := c.Query("unit_type")
	search := strings.TrimSpace(c.Query("search"))

	var units []models.OfficeUnit
	query := config.DB.Preload("Branch").Order("CASE WHEN branch_id IS NULL THEN 0 ELSE 1 END, unit_name ASC")

	if branchID != "" {
		if branchID == "pusat" || branchID == "null" || branchID == "0" {
			query = query.Where("branch_id IS NULL")
		} else {
			query = query.Where("branch_id = ?", branchID)
		}
	}
	if unitType != "" {
		query = query.Where("unit_type = ?", unitType)
	}
	if search != "" {
		term := "%" + strings.ToLower(search) + "%"
		query = query.Where("LOWER(unit_name) LIKE ? OR LOWER(code) LIKE ? OR LOWER(address) LIKE ? OR LOWER(pic_name) LIKE ?", term, term, term, term)
	}

	if err := query.Find(&units).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data unit kantor"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": units})
}

// CreateOfficeUnit creates a new office unit
func CreateOfficeUnit(c *gin.Context) {
	var input models.OfficeUnit
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if strings.TrimSpace(input.UnitName) == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Nama unit kantor wajib diisi"})
		return
	}

	if err := config.DB.Create(&input).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menambahkan unit kantor: " + err.Error()})
		return
	}

	config.DB.Preload("Branch").First(&input, input.ID)
	c.JSON(http.StatusCreated, gin.H{"message": "Unit kantor berhasil ditambahkan", "data": input})
}

// UpdateOfficeUnit updates an existing office unit
func UpdateOfficeUnit(c *gin.Context) {
	id := c.Param("id")
	var unit models.OfficeUnit
	if err := config.DB.First(&unit, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Unit kantor tidak ditemukan"})
		return
	}

	var input models.OfficeUnit
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	unit.BranchID = input.BranchID
	unit.ParentUnitID = input.ParentUnitID
	unit.UnitName = input.UnitName
	unit.UnitType = input.UnitType
	unit.Code = input.Code
	unit.Address = input.Address
	unit.PICName = input.PICName
	unit.PICPhone = input.PICPhone

	if err := config.DB.Save(&unit).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memperbarui unit kantor"})
		return
	}

	config.DB.Preload("Branch").First(&unit, unit.ID)
	c.JSON(http.StatusOK, gin.H{"message": "Unit kantor berhasil diperbarui", "data": unit})
}

// DeleteOfficeUnit deletes an office unit
func DeleteOfficeUnit(c *gin.Context) {
	id := c.Param("id")

	// Check if assets exist under this unit
	var assetCount int64
	config.DB.Model(&models.OfficeAsset{}).Where("office_unit_id = ?", id).Count(&assetCount)
	if assetCount > 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Tidak dapat menghapus unit kantor karena masih memiliki " + strconv.FormatInt(assetCount, 10) + " perangkat tercatat. Pindahkan atau hapus perangkat terlebih dahulu."})
		return
	}

	if err := config.DB.Delete(&models.OfficeUnit{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus unit kantor"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Unit kantor berhasil dihapus"})
}

// =========================================================================
// 2. OFFICE ASSET HANDLERS (Aset Internal Perusahaan & Server Kantor)
// =========================================================================

// GetOfficeAssets handles pagination, search & filtering for internal office assets
func GetOfficeAssets(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}
	offset := (page - 1) * limit

	query := config.DB.Model(&models.OfficeAsset{}).Preload("OfficeUnit.Branch")

	// Filter by Office Unit
	if officeUnitID := c.Query("office_unit_id"); officeUnitID != "" {
		query = query.Where("office_unit_id = ?", officeUnitID)
	}

	// Filter by Branch (join with office_units)
	if branchID := c.Query("branch_id"); branchID != "" {
		if branchID == "pusat" || branchID == "0" || branchID == "null" {
			query = query.Joins("JOIN office_units ON office_units.id = office_assets.office_unit_id").Where("office_units.branch_id IS NULL")
		} else {
			query = query.Joins("JOIN office_units ON office_units.id = office_assets.office_unit_id").Where("office_units.branch_id = ?", branchID)
		}
	}

	// Filter by Asset Type (Aktif, Pasif, Server & Komputasi, Jaringan Kantor, Power & UPS, Workstation/PC)
	if assetType := c.Query("asset_type"); assetType != "" {
		query = query.Where("office_assets.asset_type = ?", assetType)
	}

	// Filter by Status (Aktif, Nonaktif, Maintenance, Rusak, Spare)
	if status := c.Query("status"); status != "" {
		query = query.Where("office_assets.status = ?", status)
	}

	// Filter by Condition (Baik, Perlu Perbaikan, Rusak)
	if condition := c.Query("condition"); condition != "" {
		query = query.Where("office_assets.condition = ?", condition)
	}

	// Global Search
	if search := strings.TrimSpace(c.Query("search")); search != "" {
		term := "%" + strings.ToLower(search) + "%"
		query = query.Where(
			"LOWER(office_assets.brand) LIKE ? OR LOWER(office_assets.model) LIKE ? OR LOWER(office_assets.serial_number) LIKE ? OR LOWER(office_assets.ip_address) LIKE ? OR LOWER(office_assets.mac_address) LIKE ? OR LOWER(office_assets.location_detail) LIKE ? OR LOWER(office_assets.notes) LIKE ?",
			term, term, term, term, term, term, term,
		)
	}

	var total int64
	query.Count(&total)

	var assets []models.OfficeAsset
	if err := query.Order("office_assets.id DESC").Limit(limit).Offset(offset).Find(&assets).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data aset kantor"})
		return
	}

	totalPages := int((total + int64(limit) - 1) / int64(limit))
	if totalPages == 0 {
		totalPages = 1
	}

	c.JSON(http.StatusOK, gin.H{
		"data":        assets,
		"total":       total,
		"page":        page,
		"limit":       limit,
		"total_pages": totalPages,
	})
}

// GetOfficeAssetByID retrieves a single office asset
func GetOfficeAssetByID(c *gin.Context) {
	id := c.Param("id")
	var asset models.OfficeAsset
	if err := config.DB.Preload("OfficeUnit.Branch").First(&asset, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Aset kantor tidak ditemukan"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": asset})
}

// CreateOfficeAsset creates a new internal company office asset
func CreateOfficeAsset(c *gin.Context) {
	var input models.OfficeAsset
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if input.OfficeUnitID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Pilihan unit kantor wajib diisi"})
		return
	}
	if strings.TrimSpace(input.Brand) == "" || strings.TrimSpace(input.Model) == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Merek (Brand) dan Model perangkat wajib diisi"})
		return
	}

	// Clean SN and count
	cleanedSN, count := cleanSerialNumbers(input.SerialNumber)
	input.SerialNumber = cleanedSN
	if input.UnitCount <= 0 {
		input.UnitCount = count
	}
	if input.Ownership == "" {
		input.Ownership = "Aset Perusahaan"
	}
	if input.Status == "" {
		input.Status = "Aktif"
	}
	if input.Condition == "" {
		input.Condition = "Baik"
	}

	if err := config.DB.Create(&input).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan aset kantor: " + err.Error()})
		return
	}

	config.DB.Preload("OfficeUnit.Branch").First(&input, input.ID)
	c.JSON(http.StatusCreated, gin.H{"message": "Aset internal perusahaan berhasil ditambahkan", "data": input})
}

// UpdateOfficeAsset updates an existing office asset
func UpdateOfficeAsset(c *gin.Context) {
	id := c.Param("id")
	var asset models.OfficeAsset
	if err := config.DB.First(&asset, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Aset kantor tidak ditemukan"})
		return
	}

	var input models.OfficeAsset
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	cleanedSN, count := cleanSerialNumbers(input.SerialNumber)
	asset.OfficeUnitID = input.OfficeUnitID
	asset.AssetType = input.AssetType
	asset.Brand = input.Brand
	asset.Model = input.Model
	asset.SerialNumber = cleanedSN
	if input.UnitCount > 0 {
		asset.UnitCount = input.UnitCount
	} else {
		asset.UnitCount = count
	}
	asset.LocationDetail = input.LocationDetail
	asset.IPAddress = input.IPAddress
	asset.MACAddress = input.MACAddress
	asset.Status = input.Status
	asset.Condition = input.Condition
	asset.Ownership = input.Ownership
	asset.Notes = input.Notes

	if err := config.DB.Save(&asset).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memperbarui aset kantor"})
		return
	}

	config.DB.Preload("OfficeUnit.Branch").First(&asset, asset.ID)
	c.JSON(http.StatusOK, gin.H{"message": "Aset internal perusahaan berhasil diperbarui", "data": asset})
}

// DeleteOfficeAsset removes an office asset
func DeleteOfficeAsset(c *gin.Context) {
	id := c.Param("id")
	if err := config.DB.Delete(&models.OfficeAsset{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus aset kantor"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Aset kantor berhasil dihapus"})
}

// =========================================================================
// 3. SEPARATED OFFICE STATS & HIERARCHY TREE
// =========================================================================

// cloneOfficeAssetQuery creates a fresh query instance with the same filters
func cloneOfficeAssetQuery(branchID, officeUnitID string) *gorm.DB {
	q := config.DB.Model(&models.OfficeAsset{})
	if officeUnitID != "" {
		q = q.Where("office_unit_id = ?", officeUnitID)
	} else if branchID != "" {
		if branchID == "pusat" || branchID == "0" || branchID == "null" {
			q = q.Joins("JOIN office_units ON office_units.id = office_assets.office_unit_id").Where("office_units.branch_id IS NULL")
		} else {
			q = q.Joins("JOIN office_units ON office_units.id = office_assets.office_unit_id").Where("office_units.branch_id = ?", branchID)
		}
	}
	return q
}

// GetOfficeStats returns isolated statistics strictly for internal office assets
func GetOfficeStats(c *gin.Context) {
	branchID := c.Query("branch_id")
	officeUnitID := c.Query("office_unit_id")

	var stats models.OfficeStatsDTO

	// Total Unit Count (sum of unit_count)
	type sumResult struct {
		TotalUnits int64
	}
	var res sumResult
	cloneOfficeAssetQuery(branchID, officeUnitID).Select("COALESCE(SUM(unit_count), 0) as total_units").Scan(&res)
	stats.TotalOfficeAssets = res.TotalUnits

	// Total Units Count
	var unitCountQuery = config.DB.Model(&models.OfficeUnit{})
	if branchID != "" {
		if branchID == "pusat" || branchID == "0" || branchID == "null" {
			unitCountQuery = unitCountQuery.Where("branch_id IS NULL")
		} else {
			unitCountQuery = unitCountQuery.Where("branch_id = ?", branchID)
		}
	}
	unitCountQuery.Count(&stats.TotalOfficeUnits)

	// Breakdown counts
	var serverCount, networkCount, activeCount, maintCount, damagedCount, spareCount sumResult

	cloneOfficeAssetQuery(branchID, officeUnitID).Where("LOWER(asset_type) LIKE '%server%' OR LOWER(model) LIKE '%server%' OR LOWER(brand) LIKE '%server%'").Select("COALESCE(SUM(unit_count), 0) as total_units").Scan(&serverCount)
	stats.ServerAssets = serverCount.TotalUnits

	cloneOfficeAssetQuery(branchID, officeUnitID).Where("LOWER(asset_type) LIKE '%jaringan%' OR LOWER(asset_type) IN ('switch', 'router', 'access point', 'firewall')").Select("COALESCE(SUM(unit_count), 0) as total_units").Scan(&networkCount)
	stats.NetworkAssets = networkCount.TotalUnits

	cloneOfficeAssetQuery(branchID, officeUnitID).Where("status = ?", "Aktif").Select("COALESCE(SUM(unit_count), 0) as total_units").Scan(&activeCount)
	stats.ActiveAssets = activeCount.TotalUnits

	cloneOfficeAssetQuery(branchID, officeUnitID).Where("status = ?", "Maintenance").Select("COALESCE(SUM(unit_count), 0) as total_units").Scan(&maintCount)
	stats.MaintenanceAssets = maintCount.TotalUnits

	cloneOfficeAssetQuery(branchID, officeUnitID).Where("status = ? OR condition = ?", "Rusak", "Rusak").Select("COALESCE(SUM(unit_count), 0) as total_units").Scan(&damagedCount)
	stats.DamagedAssets = damagedCount.TotalUnits

	cloneOfficeAssetQuery(branchID, officeUnitID).Where("status IN ('Spare', 'Cadangan / Spare')").Select("COALESCE(SUM(unit_count), 0) as total_units").Scan(&spareCount)
	stats.SpareAssets = spareCount.TotalUnits

	c.JSON(http.StatusOK, gin.H{"data": stats})
}

// OfficeHierarchyDTO for structured tree response
type OfficeUnitHierarchyDTO struct {
	Unit   models.OfficeUnit    `json:"unit"`
	Assets []models.OfficeAsset `json:"assets"`
}

type OfficeBranchHierarchyDTO struct {
	BranchName string                   `json:"branch_name"`
	BranchCode string                   `json:"branch_code"`
	BranchID   *uint                    `json:"branch_id"` // null for Pusat
	Units      []OfficeUnitHierarchyDTO `json:"units"`
}

// GetOfficeHierarchy builds a visual hierarchical tree for internal company assets
func GetOfficeHierarchy(c *gin.Context) {
	var units []models.OfficeUnit
	if err := config.DB.Preload("Branch").Preload("Assets").Order("CASE WHEN branch_id IS NULL THEN 0 ELSE 1 END, unit_name ASC").Find(&units).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil hirarki aset kantor"})
		return
	}

	// Group units by Branch (or Pusat)
	branchMap := make(map[string]*OfficeBranchHierarchyDTO)
	branchOrder := make([]string, 0)

	// Ensure "Kantor Pusat / HO" is first
	pusatKey := "PUSAT"
	branchMap[pusatKey] = &OfficeBranchHierarchyDTO{
		BranchName: "Kantor Pusat (Head Office)",
		BranchCode: "HO-PST",
		BranchID:   nil,
		Units:      make([]OfficeUnitHierarchyDTO, 0),
	}
	branchOrder = append(branchOrder, pusatKey)

	for _, u := range units {
		var key string
		if u.BranchID == nil || u.Branch == nil {
			key = pusatKey
		} else {
			key = "BRANCH_" + strconv.FormatUint(uint64(*u.BranchID), 10)
			if _, exists := branchMap[key]; !exists {
				branchMap[key] = &OfficeBranchHierarchyDTO{
					BranchName: u.Branch.Name,
					BranchCode: u.Branch.Code,
					BranchID:   u.BranchID,
					Units:      make([]OfficeUnitHierarchyDTO, 0),
				}
				branchOrder = append(branchOrder, key)
			}
		}

		branchMap[key].Units = append(branchMap[key].Units, OfficeUnitHierarchyDTO{
			Unit:   u,
			Assets: u.Assets,
		})
	}

	result := make([]OfficeBranchHierarchyDTO, 0)
	for _, key := range branchOrder {
		group := branchMap[key]
		if len(group.Units) > 0 || key != pusatKey {
			result = append(result, *group)
		}
	}

	c.JSON(http.StatusOK, gin.H{"data": result})
}
