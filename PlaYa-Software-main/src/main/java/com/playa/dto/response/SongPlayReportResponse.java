package com.playa.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SongPlayReportResponse {
    private Long songId;
    private String title;
    private Long playCount;
}

