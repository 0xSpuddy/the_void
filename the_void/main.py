from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
import uvicorn

app = FastAPI(title="The Void", description="Shout into the void")

# Get the directory containing this file
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(current_dir)
frontend_dist = os.path.join(project_root, "frontend", "dist")

# Serve static files from the frontend dist directory
if os.path.exists(frontend_dist):
    app.mount("/static", StaticFiles(directory=frontend_dist), name="static")
    
    # Serve the main index.html for all routes (SPA routing)
    @app.get("/")
    async def serve_frontend():
        return FileResponse(os.path.join(frontend_dist, "index.html"))
    
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Check if the requested file exists
        file_path = os.path.join(frontend_dist, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        # Otherwise serve index.html for SPA routing
        return FileResponse(os.path.join(frontend_dist, "index.html"))
else:
    @app.get("/")
    async def root():
        return {
            "message": "The Void backend is running",
            "frontend_status": "Frontend not built. Run 'npm run build' in the frontend directory.",
            "frontend_path": frontend_dist
        }

def main():
    """Run the FastAPI application with uvicorn."""
    uvicorn.run(
        "the_void.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )

if __name__ == "__main__":
    main()