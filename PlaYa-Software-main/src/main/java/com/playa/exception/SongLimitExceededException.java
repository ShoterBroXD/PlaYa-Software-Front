package com.playa.exception;

public class SongLimitExceededException extends RuntimeException {
    private final String code;
    private final Long currentCount;
    private final Long limit;

    public SongLimitExceededException(String message) {
        super(message);
        this.code = "SONG_LIMIT_EXCEEDED";
        this.currentCount = null;
        this.limit = null;
    }

    public SongLimitExceededException(String message, Long currentCount, Long limit) {
        super(message);
        this.code = "SONG_LIMIT_EXCEEDED";
        this.currentCount = currentCount;
        this.limit = limit;
    }

    public String getCode() {
        return code;
    }

    public Long getCurrentCount() {
        return currentCount;
    }

    public Long getLimit() {
        return limit;
    }
}
