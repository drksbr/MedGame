// src/server/routes/mapRoutes.ts
import express from "express";
import { MapController } from "../controllers/MapController";

const router = express.Router();

// Rota para salvar mapa
router.post("/save", MapController.saveMap);

// Rota para carregar mapa no editor
router.get("/load", MapController.loadMap);

// Rota para listar mapas disponíveis
router.get("/list", MapController.listMaps);

// Rota para excluir mapa
router.delete("/delete", MapController.deleteMap);

// Rota para carregar mapa para o cliente (game)
router.get("/client/:mapId", MapController.getMapForClient);


export default router;
