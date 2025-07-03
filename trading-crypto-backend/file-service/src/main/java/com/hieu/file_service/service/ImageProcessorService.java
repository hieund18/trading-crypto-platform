package com.hieu.file_service.service;

import com.hieu.file_service.constant.FileType;
import net.coobird.thumbnailator.Thumbnails;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;

@Service
public class ImageProcessorService {
    public byte[] resize(MultipartFile file, FileType fileType) throws IOException {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

        BufferedImage image = ImageIO.read(file.getInputStream());

        int originalWidth = image.getWidth();
        int originalHeight = image.getHeight();

        int newWidth = Math.min(originalWidth, fileType.getMaxResize());
        int newHeight = Math.min(originalHeight, fileType.getMaxResize());

        Thumbnails.of(image)
                .size(newWidth, newHeight)
                .outputFormat("jpg")
                .outputQuality(0.8)
                .toOutputStream(outputStream);

        return outputStream.toByteArray();
    }
}
