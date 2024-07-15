import { Router } from 'express';
import { searchRoutes, airports } from '../controller/controller.js';
const router = Router();

// TODO: Make SSE version of this to test speed in frontend with yield in findRoutes()
router.get('/:src/:dst/:hops?', searchRoutes)

router.get('/airports', airports)

export default router