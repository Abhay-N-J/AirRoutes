import { Router } from 'express';
import { searchRoutes, airports, searchRoutesWithDistance, directRoutes } from '../controller/controller.js';
const router = Router();

router.get('/airports', airports)

router.get('/speed/:src/:dst/:hops?', searchRoutesWithDistance) 

router.get('/directRoutes', directRoutes)

// TODO: Make SSE version of this to test speed in frontend with yield in findRoutes()
router.get('/:src/:dst/:hops?', searchRoutes)

export default router