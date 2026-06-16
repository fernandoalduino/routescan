import { Router } from 'express';
const router = Router();

router.get('/', (req, res) => res.json([]));
router.post('/', (req, res) => res.json({}));
router.delete('/:id', (req, res) => res.send('ok'));

export default router;