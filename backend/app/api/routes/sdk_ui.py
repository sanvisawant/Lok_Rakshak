# app/api/routes/sdk_ui.py
# Serves the mobile citizen SDK web app as a simple HTML page via GET /sdk
# This is already mounted in start_server.py — nothing else needed.

# (Intentionally empty — the HTML is served by the @app.get("/sdk") route
#  directly in start_server.py using the static/sdk_app.html file.)
