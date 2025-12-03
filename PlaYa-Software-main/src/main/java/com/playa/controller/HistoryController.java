package com.playa.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.playa.service.HistoryService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/history")
public class HistoryController {

    private HistoryService historyService;

    // POST /api/v1/history - Registrar reproducción
    // GET /api/v1/history/{idUser} - Historial de usuario
}
