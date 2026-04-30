package com.tea.teaculture_service.controller;

import com.tea.teaculture_service.dto.ApiResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpServletRequest;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Locale;
import java.util.UUID;

@RestController
@RequestMapping("/upload")
public class UploadController {

    @Value("${upload.dir:uploads}")
    private String uploadDir;

    @PostMapping(value = "/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<String> uploadImage(@RequestParam("file") MultipartFile file, HttpServletRequest request) throws Exception {
        if (file == null || file.isEmpty()) {
            return ApiResponse.badRequest("文件不能为空");
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.toLowerCase(Locale.ROOT).startsWith("image/")) {
            return ApiResponse.badRequest("仅支持图片上传");
        }
        Path dir = Path.of(uploadDir).toAbsolutePath().normalize();
        Files.createDirectories(dir);

        String original = file.getOriginalFilename();
        String ext = "";
        if (original != null && original.contains(".")) {
            ext = original.substring(original.lastIndexOf('.')).toLowerCase(Locale.ROOT);
            if (ext.length() > 10) ext = "";
        }
        String name = UUID.randomUUID().toString().replace("-", "") + ext;
        Path target = dir.resolve(name).normalize();
        if (!target.startsWith(dir)) {
            return ApiResponse.fail("非法路径");
        }
        file.transferTo(target);

        String url = request.getScheme() + "://" + request.getServerName() + ":" + request.getServerPort()
                + request.getContextPath() + "/upload/" + name;
        return ApiResponse.ok(url);
    }
}

