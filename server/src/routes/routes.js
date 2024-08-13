import { Router } from 'express';
import { searchRoutes, airports, searchRoutesWithDistance, directRoutes, realtimeRoutes } from '../controller/controller.js';
const router = Router();

router.get('/airports', airports)

router.get('/speed/:src/:dst/:hops?', searchRoutesWithDistance) 

router.get('/directRoutes', directRoutes)

router.post('/realtime/:src/:dst/:hops?', realtimeRoutes)

// TODO: Make SSE version of this to test speed in frontend with yield in findRoutes()
router.post('/:src/:dst/:hops?', searchRoutes)

export default router