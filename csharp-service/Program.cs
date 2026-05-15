using CSharpService;
using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);

// Enable CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
    });
});

var app = builder.Build();
app.UseCors();

app.MapPost("/visualize", ([FromBody] System.Text.Json.JsonElement body) => {
    string algo = body.GetProperty("algorithm").GetString()!;
    var data = body.GetProperty("array").EnumerateArray().Select(x => x.GetInt32()).ToList();
    return Algorithms.RunSort(algo, data, AlgorithmMode.visualization);
});

app.MapPost("/benchmark", ([FromBody] System.Text.Json.JsonElement body) => {
    string algo = body.GetProperty("algorithm").GetString()!;
    var data = body.GetProperty("array").EnumerateArray().Select(x => x.GetInt32()).ToList();
    return Algorithms.RunSort(algo, data, AlgorithmMode.benchmark);
});

app.Run("http://0.0.0.0:8083");
