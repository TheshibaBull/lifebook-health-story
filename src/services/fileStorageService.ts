
export interface StoredFile {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadDate: Date;
  data: string; // base64
  category: string;
  tags: string[];
  extractedText: string;
  medicalEntities?: any;
  thumbnail?: string;
}

export class FileStorageService {
  private static readonly STORAGE_KEY = 'lifebook-health-records';
  
  static async saveFile(file: File, analysis: any): Promise<StoredFile> {
    const base64Data = await this.fileToBase64(file);
    const thumbnail = await this.generateThumbnail(file);
    
    const storedFile: StoredFile = {
      id: crypto.randomUUID(),
      name: file.name,
      type: file.type,
      size: file.size,
      uploadDate: new Date(),
      data: base64Data,
      category: analysis.category,
      tags: analysis.tags,
      extractedText: analysis.extractedText,
      medicalEntities: analysis.medicalEntities,
      thumbnail
    };
    
    const existingFiles = this.getAllFiles();
    const updatedFiles = [...existingFiles, storedFile];
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedFiles));
    
    return storedFile;
  }
  
  static getAllFiles(): StoredFile[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) return [];
    
    try {
      return JSON.parse(stored).map((file: any) => ({
        ...file,
        uploadDate: new Date(file.uploadDate)
      }));
    } catch {
      return [];
    }
  }
  
  static getFileById(id: string): StoredFile | null {
    const files = this.getAllFiles();
    return files.find(file => file.id === id) || null;
  }
  
  static updateFile(id: string, updates: Partial<StoredFile>): boolean {
    const files = this.getAllFiles();
    const fileIndex = files.findIndex(file => file.id === id);
    
    if (fileIndex === -1) return false;
    
    files[fileIndex] = { ...files[fileIndex], ...updates };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(files));
    return true;
  }
  
  static deleteFile(id: string): boolean {
    const files = this.getAllFiles();
    const filteredFiles = files.filter(file => file.id !== id);
    
    if (filteredFiles.length === files.length) return false;
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredFiles));
    return true;
  }
  
  static searchFiles(query: string): StoredFile[] {
    const files = this.getAllFiles();
    const searchTerms = query.toLowerCase().split(' ');
    
    return files.filter(file => {
      const searchableText = [
        file.name,
        file.category,
        file.extractedText,
        ...file.tags
      ].join(' ').toLowerCase();
      
      return searchTerms.every(term => searchableText.includes(term));
    });
  }
  
  static getFilesByCategory(category: string): StoredFile[] {
    return this.getAllFiles().filter(file => file.category === category);
  }
  
  static getFilesByTag(tag: string): StoredFile[] {
    return this.getAllFiles().filter(file => file.tags.includes(tag));
  }
  
  private static fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }
  
  private static async generateThumbnail(file: File): Promise<string | undefined> {
    if (!file.type.startsWith('image/')) return undefined;
    
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = 150;
        canvas.height = 150;
        
        const aspectRatio = img.width / img.height;
        let drawWidth = canvas.width;
        let drawHeight = canvas.height;
        
        if (aspectRatio > 1) {
          drawHeight = canvas.width / aspectRatio;
        } else {
          drawWidth = canvas.height * aspectRatio;
        }
        
        const x = (canvas.width - drawWidth) / 2;
        const y = (canvas.height - drawHeight) / 2;
        
        ctx?.drawImage(img, x, y, drawWidth, drawHeight);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  }
}
