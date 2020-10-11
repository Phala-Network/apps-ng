export const CLI_SUBSTRATE_API = (
  process.env.SUBSTRATE_API 
  || (process.env.APP_PHALA_URL && `wss://${process.env.APP_PHALA_URL}/ws`)
  || 'ws://localhost:9944'
)
export const CLI_PRUNTIME_API = (
  process.env.PRUNTIME_API
  || (process.env.APP_PHALA_URL && `https://${process.env.APP_PHALA_URL}/tee-api/`)
  || 'http://localhost:8000'
)
