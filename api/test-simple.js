// Semplice test API per Vercel - ES Modules
export default function handler(req, res) {
  res.status(200).json({
    success: true,
    message: "API test funziona!",
    method: req.method,
    timestamp: new Date().toISOString(),
    vercel: true,
    esmodules: true,
  });
}
