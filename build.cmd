python build_references.py
tsc src/app.ts --out build/app.js --sourcemap --target ES5
tsc src/server.ts --out build/server.js --target ES5