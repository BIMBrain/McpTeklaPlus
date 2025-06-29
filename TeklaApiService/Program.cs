using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers()
    .AddNewtonsoftJson(options =>
    {
        options.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore;
    });

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "MCP Tekla+ API",
        Version = "v1",
        Description = "Tekla Structures 2025 Open API 整合服務",
        Contact = new OpenApiContact
        {
            Name = "BIMBrain",
            Email = "ppson0@gmail.com",
            Url = new Uri("https://github.com/BIMBrain/McpTeklaPlus")
        }
    });

    // 包含 XML 註釋
    var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
    {
        c.IncludeXmlComments(xmlPath);
    }
});

// CORS 設定
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// 日誌設定
builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddDebug();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "MCP Tekla+ API v1");
        c.RoutePrefix = string.Empty; // 讓 Swagger UI 在根路徑顯示
    });
}

app.UseHttpsRedirection();

app.UseCors("AllowReactApp");

app.UseAuthorization();

app.MapControllers();

// 健康檢查端點
app.MapGet("/health", () => new
{
    Status = "Healthy",
    Timestamp = DateTime.Now,
    Version = "1.0.0",
    Service = "MCP Tekla+ API"
});

// 根路徑重定向到 Swagger
app.MapGet("/", () => Results.Redirect("/swagger"));

app.Run();
