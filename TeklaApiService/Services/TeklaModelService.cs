using Tekla.Structures.Model;
using Tekla.Structures.Geometry3d;
using Tekla.Structures.Catalogs;

namespace TeklaApiService.Services
{
    /// <summary>
    /// Tekla 模型操作服務
    /// </summary>
    public class TeklaModelService
    {
        private readonly ILogger<TeklaModelService> _logger;
        private Model? _model;

        public TeklaModelService(ILogger<TeklaModelService> logger)
        {
            _logger = logger;
        }

        /// <summary>
        /// 獲取或創建模型連接
        /// </summary>
        public Model GetModel()
        {
            if (_model == null)
            {
                _model = new Model();
            }
            return _model;
        }

        /// <summary>
        /// 檢查模型連接狀態
        /// </summary>
        public bool IsConnected()
        {
            try
            {
                var model = GetModel();
                return model.GetConnectionStatus();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "檢查模型連接時發生錯誤");
                return false;
            }
        }

        /// <summary>
        /// 創建結構樑
        /// </summary>
        public async Task<(bool Success, int? BeamId, string Message)> CreateBeamAsync(
            Point startPoint, 
            Point endPoint, 
            string profile, 
            string material,
            string? className = null,
            string? name = null)
        {
            try
            {
                var model = GetModel();
                if (!model.GetConnectionStatus())
                {
                    return (false, null, "無法連接到 Tekla Structures");
                }

                var beam = new Beam
                {
                    StartPoint = startPoint,
                    EndPoint = endPoint,
                    Profile = { ProfileString = profile },
                    Material = { MaterialString = material },
                    Class = className ?? "1",
                    Name = name ?? "BEAM"
                };

                beam.Insert();
                model.CommitChanges();

                _logger.LogInformation($"成功創建樑 ID: {beam.Identifier.ID}");
                return (true, beam.Identifier.ID, "樑創建成功");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "創建樑時發生錯誤");
                return (false, null, $"創建樑失敗: {ex.Message}");
            }
        }

        /// <summary>
        /// 創建結構柱
        /// </summary>
        public async Task<(bool Success, int? ColumnId, string Message)> CreateColumnAsync(
            Point startPoint, 
            Point endPoint, 
            string profile, 
            string material,
            string? className = null,
            string? name = null)
        {
            try
            {
                var model = GetModel();
                if (!model.GetConnectionStatus())
                {
                    return (false, null, "無法連接到 Tekla Structures");
                }

                var column = new Beam
                {
                    StartPoint = startPoint,
                    EndPoint = endPoint,
                    Profile = { ProfileString = profile },
                    Material = { MaterialString = material },
                    Class = className ?? "2",
                    Name = name ?? "COLUMN"
                };

                column.Insert();
                model.CommitChanges();

                _logger.LogInformation($"成功創建柱 ID: {column.Identifier.ID}");
                return (true, column.Identifier.ID, "柱創建成功");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "創建柱時發生錯誤");
                return (false, null, $"創建柱失敗: {ex.Message}");
            }
        }

        /// <summary>
        /// 獲取所有樑的信息
        /// </summary>
        public async Task<List<BeamInfo>> GetAllBeamsAsync()
        {
            var beams = new List<BeamInfo>();
            
            try
            {
                var model = GetModel();
                if (!model.GetConnectionStatus())
                {
                    _logger.LogWarning("無法連接到 Tekla Structures");
                    return beams;
                }

                var modelObjectEnumerator = model.GetModelObjectSelector()
                    .GetAllObjectsWithType(ModelObject.ModelObjectEnum.BEAM);

                while (modelObjectEnumerator.MoveNext())
                {
                    if (modelObjectEnumerator.Current is Beam beam)
                    {
                        beams.Add(new BeamInfo
                        {
                            Id = beam.Identifier.ID,
                            Profile = beam.Profile.ProfileString,
                            Material = beam.Material.MaterialString,
                            StartPoint = new PointInfo 
                            { 
                                X = beam.StartPoint.X, 
                                Y = beam.StartPoint.Y, 
                                Z = beam.StartPoint.Z 
                            },
                            EndPoint = new PointInfo 
                            { 
                                X = beam.EndPoint.X, 
                                Y = beam.EndPoint.Y, 
                                Z = beam.EndPoint.Z 
                            },
                            Class = beam.Class,
                            Name = beam.Name,
                            Length = Distance.PointToPoint(beam.StartPoint, beam.EndPoint)
                        });
                    }
                }

                _logger.LogInformation($"獲取到 {beams.Count} 個樑");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "獲取樑信息時發生錯誤");
            }

            return beams;
        }

        /// <summary>
        /// 刪除模型對象
        /// </summary>
        public async Task<(bool Success, string Message)> DeleteObjectAsync(int objectId)
        {
            try
            {
                var model = GetModel();
                if (!model.GetConnectionStatus())
                {
                    return (false, "無法連接到 Tekla Structures");
                }

                var modelObject = model.SelectModelObject(new Identifier(objectId));
                if (modelObject != null)
                {
                    modelObject.Delete();
                    model.CommitChanges();
                    
                    _logger.LogInformation($"成功刪除對象 ID: {objectId}");
                    return (true, "對象刪除成功");
                }
                else
                {
                    return (false, "找不到指定的對象");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"刪除對象 {objectId} 時發生錯誤");
                return (false, $"刪除對象失敗: {ex.Message}");
            }
        }

        /// <summary>
        /// 獲取材料目錄
        /// </summary>
        public async Task<List<string>> GetMaterialsAsync()
        {
            var materials = new List<string>();
            
            try
            {
                var materialCatalog = new MaterialCatalog();
                var materialNames = materialCatalog.GetMaterialNames();
                
                foreach (string material in materialNames)
                {
                    materials.Add(material);
                }

                _logger.LogInformation($"獲取到 {materials.Count} 種材料");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "獲取材料目錄時發生錯誤");
            }

            return materials;
        }

        /// <summary>
        /// 獲取截面目錄
        /// </summary>
        public async Task<List<string>> GetProfilesAsync()
        {
            var profiles = new List<string>();
            
            try
            {
                var profileCatalog = new ProfileCatalog();
                var profileNames = profileCatalog.GetProfileNames();
                
                foreach (string profile in profileNames)
                {
                    profiles.Add(profile);
                }

                _logger.LogInformation($"獲取到 {profiles.Count} 種截面");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "獲取截面目錄時發生錯誤");
            }

            return profiles;
        }
    }

    // 數據傳輸對象
    public class BeamInfo
    {
        public int Id { get; set; }
        public string Profile { get; set; } = string.Empty;
        public string Material { get; set; } = string.Empty;
        public PointInfo StartPoint { get; set; } = new();
        public PointInfo EndPoint { get; set; } = new();
        public string Class { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public double Length { get; set; }
    }

    public class PointInfo
    {
        public double X { get; set; }
        public double Y { get; set; }
        public double Z { get; set; }
    }
}
