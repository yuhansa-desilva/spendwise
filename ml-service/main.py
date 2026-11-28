from fastapi import FastAPI

app = FastAPI(title="SpendWise ML Service")


@app.get("/")
def root():
    return {"message": "Hello from the SpendWise ML service"}


@app.get("/health")
def health():
    return {"status": "ok"}