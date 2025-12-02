import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  original_filename?: string;
  bytes?: number;
  duration?: number;
  format?: string;
}

@Injectable({
  providedIn: 'root',
})
export class CloudinaryService {
  private readonly cloudName = environment.cloudinary.cloudName;
  private readonly uploadPreset = environment.cloudinary.uploadPreset;
  private readonly folder = environment.cloudinary.folder;

  constructor(private http: HttpClient) {}

  uploadFile(file: File, resourceType: 'auto' | 'image' = 'auto'): Observable<CloudinaryUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.uploadPreset);

    if (this.folder) {
      formData.append('folder', this.folder);
    }

    const url = `https://api.cloudinary.com/v1_1/${this.cloudName}/${resourceType}/upload`;
    return this.http.post<CloudinaryUploadResponse>(url, formData);
  }
}
