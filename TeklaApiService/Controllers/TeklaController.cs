using Microsoft.AspNetCore.Mvc;
using Tekla.Structures.Model;
using Tekla.Structures.Geometry3d;
using Tekla.Structures.Catalogs;
using Tekla.Structures.Drawing;

namespace TeklaApiService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TeklaController : ControllerBase
    {
        private readonly ILogger<TeklaController> _logger;

        public TeklaController(ILogger<TeklaController> logger)
        {
            _logger = logger;
        }

        /// <summary>
        /// 檢查 Tekla Structures 連接狀態
        /// </summary>
        [HttpGet("connection-status")]
        public async Task<IActionResult> GetConnectionStatus()
        {
            try
            {
                var model = new Model();
                var isConnected = model.GetConnectionStatus();
                
                return Ok(new 
                { 
                    IsConnected = isConnected,
                    Message = isConnected ? "已連接到 Tekla Structures" : "未連接到 Tekla Structures",
                    Timestamp = DateTime.Now
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "檢查連接狀態時發生錯誤");
                return BadRequest($"錯誤: {ex.Message}");
            }
        }

        /// <summary>
        /// 創建鋼樑
        /// </summary>
        [HttpPost("create-beam")]
        public async Task<IActionResult> CreateBeam([FromBody] BeamRequest request)
        {
            try
            {
                var model = new Model();
                if (!model.GetConnectionStatus())
                    return BadRequest("無法連接到 Tekla Structures");

                var beam = new Beam
                {
                    StartPoint = new Point(request.StartX, request.StartY, request.StartZ),
                    EndPoint = new Point(request.EndX, request.EndY, request.EndZ),
                    Profile = { ProfileString = request.Profile },
                    Material = { MaterialString = request.Material },
                    Class = request.Class ?? "1",
                    Name = request.Name ?? "BEAM"
                };

                // 設置位置
                if (request.Position != null)
                {
                    beam.Position.Depth = (Position.DepthEnum)request.Position.Depth;
                    beam.Position.Plane = (Position.PlaneEnum)request.Position.Plane;
                    beam.Position.Rotation = (Position.RotationEnum)request.Position.Rotation;
                }

                beam.Insert();
                model.CommitChanges();

                _logger.LogInformation($"成功創建鋼樑 ID: {beam.Identifier.ID}");

                return Ok(new 
                { 
                    BeamId = beam.Identifier.ID, 
                    Message = "鋼樑創建成功",
                    Profile = request.Profile,
                    Material = request.Material
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "創建鋼樑時發生錯誤");
                return BadRequest($"錯誤: {ex.Message}");
            }
        }

        /// <summary>
        /// 獲取材料目錄
        /// </summary>
        [HttpGet("materials")]
        public async Task<IActionResult> GetMaterials()
        {
            try
            {
                var materialCatalog = new MaterialCatalog();
                var materials = materialCatalog.GetMaterialNames();
                
                var materialList = new List<string>();
                foreach (string material in materials)
                {
                    materialList.Add(material);
                }

                return Ok(new 
                { 
                    Materials = materialList,
                    Count = materialList.Count,
                    Message = "材料目錄獲取成功"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "獲取材料目錄時發生錯誤");
                return BadRequest($"錯誤: {ex.Message}");
            }
        }

        /// <summary>
        /// 獲取截面目錄
        /// </summary>
        [HttpGet("profiles")]
        public async Task<IActionResult> GetProfiles()
        {
            try
            {
                var profileCatalog = new ProfileCatalog();
                var profiles = profileCatalog.GetProfileNames();
                
                var profileList = new List<string>();
                foreach (string profile in profiles)
                {
                    profileList.Add(profile);
                }

                return Ok(new 
                { 
                    Profiles = profileList,
                    Count = profileList.Count,
                    Message = "截面目錄獲取成功"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "獲取截面目錄時發生錯誤");
                return BadRequest($"錯誤: {ex.Message}");
            }
        }

        /// <summary>
        /// 獲取模型中的所有樑
        /// </summary>
        [HttpGet("beams")]
        public async Task<IActionResult> GetBeams()
        {
            try
            {
                var model = new Model();
                if (!model.GetConnectionStatus())
                    return BadRequest("無法連接到 Tekla Structures");

                var beams = new List<object>();
                var modelObjectEnumerator = model.GetModelObjectSelector().GetAllObjectsWithType(ModelObject.ModelObjectEnum.BEAM);

                while (modelObjectEnumerator.MoveNext())
                {
                    if (modelObjectEnumerator.Current is Beam beam)
                    {
                        beams.Add(new
                        {
                            Id = beam.Identifier.ID,
                            Profile = beam.Profile.ProfileString,
                            Material = beam.Material.MaterialString,
                            StartPoint = new { X = beam.StartPoint.X, Y = beam.StartPoint.Y, Z = beam.StartPoint.Z },
                            EndPoint = new { X = beam.EndPoint.X, Y = beam.EndPoint.Y, Z = beam.EndPoint.Z },
                            Class = beam.Class,
                            Name = beam.Name
                        });
                    }
                }

                return Ok(new 
                { 
                    Beams = beams,
                    Count = beams.Count,
                    Message = "樑列表獲取成功"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "獲取樑列表時發生錯誤");
                return BadRequest($"錯誤: {ex.Message}");
            }
        }

        /// <summary>
        /// 創建圖紙
        /// </summary>
        [HttpPost("create-drawing")]
        public async Task<IActionResult> CreateDrawing([FromBody] DrawingRequest request)
        {
            try
            {
                var drawingHandler = new DrawingHandler();
                var drawing = new GADrawing(request.Name, request.Layout ?? "A1");
                
                drawing.Insert();

                return Ok(new 
                { 
                    DrawingId = drawing.GetId(),
                    Name = request.Name,
                    Layout = request.Layout ?? "A1",
                    Message = "圖紙創建成功"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "創建圖紙時發生錯誤");
                return BadRequest($"錯誤: {ex.Message}");
            }
        }
    }

    // 請求模型類別
    public class BeamRequest
    {
        public double StartX { get; set; }
        public double StartY { get; set; }
        public double StartZ { get; set; }
        public double EndX { get; set; }
        public double EndY { get; set; }
        public double EndZ { get; set; }
        public string Profile { get; set; } = "HEA300";
        public string Material { get; set; } = "S355";
        public string? Class { get; set; }
        public string? Name { get; set; }
        public BeamPosition? Position { get; set; }
    }

    public class BeamPosition
    {
        public int Depth { get; set; } = 1; // Middle
        public int Plane { get; set; } = 1; // Middle
        public int Rotation { get; set; } = 0; // Front
    }

    public class DrawingRequest
    {
        public string Name { get; set; } = "新圖紙";
        public string? Layout { get; set; }
    }
}
