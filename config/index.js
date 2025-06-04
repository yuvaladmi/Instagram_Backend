import dotenv from 'dotenv'
dotenv.config()
import getConfigProd from './prod.js'
import getConfigDev from './dev.js'


export var config
if (process.env.NODE_ENV === 'production') {
    config = getConfigProd()
} else {
    config = getConfigDev()
}



//* Uncomment the following line to use guest mode
config.isGuestMode = true


//* Uncomment the following line to use the production configuration (Mongo Atlas DB)
// config = configProd
