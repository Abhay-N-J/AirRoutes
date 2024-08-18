import { Router } from 'express';
import { searchRoutes, airports, searchRoutesWithDistance, directRoutes, realtimeRoutes } from '../controller/controller.js';
const router = Router();

router.get('/airports', airports)

router.get('/speed/:src/:dst/:hops?', searchRoutesWithDistance) 

router.get('/directRoutes', directRoutes)

router.post('/realtime/:src/:dst/:hops?', realtimeRoutes)

//experimenting with long url in get request
router.get('/:src/:dst/:hops?', searchRoutes)

export default router