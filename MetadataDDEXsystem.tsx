import React, { useState, useRef } from 'react';
import { Button } from "/components/ui/button";
import { Input } from "/components/ui/input";
import { Label } from "/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "/components/ui/card";
// @ts-ignore - xlsx will be loaded via CDN
let XLSX: any = null;

// Load XLSX library from CDN
const script = document.createElement('script');
script.src = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
script.onload = () => {
  XLSX = (window as any).XLSX;
  console.log('XLSX library loaded successfully');
};
script.onerror = () => {
  console.error('Failed to load XLSX library');
};
document.head.appendChild(script);

const DatabaseManagementSystem = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [formData, setFormData] = useState({
    upc: '',
    message_type: '',
    track_artist: '',
    album_artist: '',
    track_name: '',
    album_name: '',
    track_no: '',
    label: '',
    duration: '',
    isrc_audio: '',
    isrc_video: '',
    original_release_date: '',
    availability_date: '',
    genre_1: '',
    genre_2: '',
    songwriter: '',
    composer: '',
    link_content: '',
    artwork_file_name: '',
    produser_mlc: '',
    original_master_owner: '',
    performer_session_musician: '',
    performer_cmo: '',
    composer_cmo: '',
    publisher: '',
    country: '',
    language: '',
  });
  const [submittedData, setSubmittedData] = useState<any[]>([]);
  const [loginError, setLoginError] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple authentication - in real app, this would call an API
    if (username === 'admin' && password === 'password') {
      setIsLoggedIn(true);
      setLoginError('');
      // Load existing data from localStorage
      const storedData = localStorage.getItem('databaseEntries');
      if (storedData) {
        setSubmittedData(JSON.parse(storedData));
      }
    } else {
      setLoginError('Invalid username or password');
    }
  };

  const viewEntryDetails = (entry: any) => {
    setSelectedEntry(entry);
    setViewMode('detail');
  };

  const backToList = () => {
    setSelectedEntry(null);
    setViewMode('list');
  };

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Validate and format the imported data
        const formattedData = jsonData.map((item: any) => ({
          ...item,
          id: Date.now() + Math.random(), // Generate unique ID
          input_date: new Date().toISOString()
        }));

        const updatedData = [...submittedData, ...formattedData];
        setSubmittedData(updatedData);
        localStorage.setItem('databaseEntries', JSON.stringify(updatedData));
        
        alert(`Successfully imported ${formattedData.length} records`);
        
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (error) {
        alert('Error importing Excel file. Please make sure it matches the template format.');
        console.error('Import error:', error);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const triggerImport = () => {
    fileInputRef.current?.click();
  };

  const downloadTemplate = () => {
    // Create template data structure
    const templateData = [{
      upc: '',
      message_type: '',
      track_artist: '',
      album_artist: '',
      track_name: '',
      album_name: '',
      track_no: '',
      label: '',
      duration: '',
      isrc_audio: '',
      isrc_video: '',
      original_release_date: '',
      availability_date: '',
      genre_1: '',
      genre_2: '',
      songwriter: '',
      composer: '',
      link_content: '',
      artwork_file_name: '',
      produser_mlc: '',
      original_master_owner: '',
      performer_session_musician: '',
      performer_cmo: '',
      composer_cmo: '',
      publisher: '',
      country: '',
      language: ''
    }];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');
    
    XLSX.writeFile(workbook, 'database_template.xlsx');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setPassword('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate mandatory fields
    const mandatoryFields = [
      'upc', 'message_type', 'track_artist', 'album_artist', 
      'track_name', 'album_name', 'track_no', 'label', 'duration',
      'isrc_audio', 'isrc_video', 'original_release_date', 'availability_date',
      'genre_1', 'genre_2', 'songwriter', 'composer'
    ];
    
    const missingFields = mandatoryFields.filter(field => !formData[field as keyof typeof formData]);
    
    if (missingFields.length > 0) {
      alert(`Please fill all mandatory fields: ${missingFields.join(', ')}`);
      return;
    }
    
    // Add timestamp and save
    const newEntry = {
      ...formData,
      id: Date.now(),
      input_date: new Date().toISOString()
    };
    
    const updatedData = [...submittedData, newEntry];
    setSubmittedData(updatedData);
    localStorage.setItem('databaseEntries', JSON.stringify(updatedData));
    
    // Reset form
    setFormData({
      upc: '',
      message_type: '',
      track_artist: '',
      album_artist: '',
      track_name: '',
      album_name: '',
      track_no: '',
      label: '',
      duration: '',
      isrc_audio: '',
      isrc_video: '',
      original_release_date: '',
      availability_date: '',
      genre_1: '',
      genre_2: '',
      songwriter: '',
      composer: '',
      produser_mlc: '',
      original_master_owner: '',
      performer_session_musician: '',
      performer_cmo: '',
      composer_cmo: '',
      publisher: '',
      country: '',
      language: '',
    });
    
    alert('Data submitted successfully!');
  };

  const exportToCSV = () => {
    if (submittedData.length === 0) {
      alert('No data to export');
      return;
    }
    
    // Create CSV content
    const headers = Object.keys(submittedData[0]).join(',');
    const rows = submittedData.map(item => 
      Object.values(item).map(value => 
        typeof value === 'string' && value.includes(',') ? `"${value}"` : value
      ).join(',')
    );
    
    const csvContent = [headers, ...rows].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'database_export.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAllCSV = () => {
    if (submittedData.length === 0) {
      alert('No data to download');
      return;
    }
    
    // Create comprehensive CSV content
    const headers = Object.keys(submittedData[0]).join(',');
    const rows = submittedData.map(item => 
      Object.values(item).map(value => 
        typeof value === 'string' && value.includes(',') ? `"${value}"` : value
      ).join(',')
    );
    
    const csvContent = [headers, ...rows].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'complete_database_export.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleTakedownByISRC = (isrc: string) => {
    if (!isrc) {
      alert('No ISRC provided for takedown');
      return;
    }
    
    // Filter out entries with matching ISRC (audio or video)
    const updatedData = submittedData.filter(item => 
      item.isrc_audio !== isrc && item.isrc_video !== isrc
    );
    
    if (updatedData.length === submittedData.length) {
      alert(`No entries found with ISRC: ${isrc}`);
      return;
    }
    
    setSubmittedData(updatedData);
    localStorage.setItem('databaseEntries', JSON.stringify(updatedData));
    alert(`Takedown completed for ISRC: ${isrc}. Removed ${submittedData.length - updatedData.length} entries.`);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Database Management System</CardTitle>
            <CardDescription className="text-center">
              Please login to access the database
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {loginError && (
                <div className="text-destructive text-sm">{loginError}</div>
              )}
              <Button type="submit" className="w-full">
                Login
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              Demo credentials: admin / password
            </p>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">Database Management System</h1>
          <div className="flex gap-4 items-center">
            <Button onClick={exportToCSV} variant="outline">
              Export Current View
            </Button>
            <Button onClick={downloadAllCSV} variant="outline">
              Download All CSV
            </Button>
            <Button onClick={triggerImport} variant="outline">
              Import Excel
            </Button>
            <Button onClick={downloadTemplate} variant="outline">
              Download Template
            </Button>
            <Button onClick={handleLogout} variant="ghost">
              Logout
            </Button>
          </div>
        </header>
        
        {/* Hidden file input for import */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleImportExcel}
          style={{ display: 'none' }}
        />

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Data Input Form</CardTitle>
            <CardDescription>
              Enter the required information. Fields marked with * are mandatory.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Mandatory Fields */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Mandatory Fields</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="upc">UPC *</Label>
                  <Input
                    id="upc"
                    name="upc"
                    value={formData.upc}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message_type">Message Type *</Label>
                  <Input
                    id="message_type"
                    name="message_type"
                    value={formData.message_type}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="track_artist">Track Artist *</Label>
                  <Input
                    id="track_artist"
                    name="track_artist"
                    value={formData.track_artist}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="album_artist">Album Artist *</Label>
                  <Input
                    id="album_artist"
                    name="album_artist"
                    value={formData.album_artist}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="track_name">Track Name *</Label>
                  <Input
                    id="track_name"
                    name="track_name"
                    value={formData.track_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="album_name">Album Name *</Label>
                  <Input
                    id="album_name"
                    name="album_name"
                    value={formData.album_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="track_no">Track Number *</Label>
                  <Input
                    id="track_no"
                    name="track_no"
                    type="number"
                    value={formData.track_no}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="label">Label *</Label>
                  <Input
                    id="label"
                    name="label"
                    value={formData.label}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration *</Label>
                  <Input
                    id="duration"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="isrc_audio">ISRC Audio *</Label>
                  <Input
                    id="isrc_audio"
                    name="isrc_audio"
                    value={formData.isrc_audio}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground opacity-0">.</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="isrc_video">ISRC Video *</Label>
                  <Input
                    id="isrc_video"
                    name="isrc_video"
                    value={formData.isrc_video}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="original_release_date">Original Release Date *</Label>
                  <Input
                    id="original_release_date"
                    name="original_release_date"
                    type="date"
                    value={formData.original_release_date}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="availability_date">Availability Date *</Label>
                  <Input
                    id="availability_date"
                    name="availability_date"
                    type="date"
                    value={formData.availability_date}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="genre_1">Genre 1 *</Label>
                  <Input
                    id="genre_1"
                    name="genre_1"
                    value={formData.genre_1}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="genre_2">Genre 2 *</Label>
                  <Input
                    id="genre_2"
                    name="genre_2"
                    value={formData.genre_2}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="songwriter">Songwriter *</Label>
                  <Input
                    id="songwriter"
                    name="songwriter"
                    value={formData.songwriter}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="composer">Composer *</Label>
                  <Input
                    id="composer"
                    name="composer"
                    value={formData.composer}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                
              </div>

              {/* Optional */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Additional Mandatory Fields</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="produser_mlc">Produser MLC</Label>
                  <Input
                    id="produser_mlc"
                    name="produser_mlc"
                    value={formData.produser_mlc}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="original_master_owner">Original Master Owner</Label>
                  <Input
                    id="original_master_owner"
                    name="original_master_owner"
                    value={formData.original_master_owner}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="performer_cmo">Performer CMO</Label>
                  <Input
                    id="performer_cmo"
                    name="performer_cmo"
                    value={formData.performer_cmo}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="publisher">Publisher</Label>
                  <Input
                    id="publisher"
                    name="publisher"
                    value={formData.publisher}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Input
                    id="language"
                    name="language"
                    value={formData.language}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              {/* Additional Optional */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Optional Fields</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="performer_session_musician">Performer Session Musician</Label>
                  <Input
                    id="performer_session_musician"
                    name="performer_session_musician"
                    value={formData.performer_session_musician}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="composer_cmo">Composer CMO</Label>
                  <Input
                    id="composer_cmo"
                    name="composer_cmo"
                    value={formData.composer_cmo}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter>
            <Button type="submit" onClick={handleSubmit} className="w-full">
              Submit Data
            </Button>
          </CardFooter>
        </Card>

        {viewMode === 'list' ? (
          submittedData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Data Overview ({submittedData.length} entries)</CardTitle>
                <CardDescription>
                  Click on any entry to view detailed information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">ID</th>
                        <th className="text-left p-2">Track Name</th>
                        <th className="text-left p-2">Artist</th>
                        <th className="text-left p-2">Album</th>
                        <th className="text-left p-2">UPC</th>
                        <th className="text-left p-2">Date Added</th>
                        <th className="text-left p-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {submittedData.map((item) => (
                        <tr key={item.id} className="border-b hover:bg-muted/50">
                          <td className="p-2">{item.id}</td>
                          <td className="p-2">{item.track_name}</td>
                          <td className="p-2">{item.track_artist}</td>
                          <td className="p-2">{item.album_name}</td>
                          <td className="p-2">{item.upc}</td>
                          <td className="p-2">{new Date(item.input_date).toLocaleDateString()}</td>
                          <td className="p-2">
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => viewEntryDetails(item)}
                              >
                                View
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => handleTakedownByISRC(item.isrc_audio)}
                                title={`Takedown by ISRC: ${item.isrc_audio}`}
                              >
                                Takedown
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )
        ) : (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Entry Details</CardTitle>
                  <CardDescription>
                    Detailed information for selected entry
                  </CardDescription>
                </div>
                <Button onClick={backToList} variant="outline">
                  Back to List
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {selectedEntry && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(selectedEntry).map(([key, value]) => (
                    <div key={key} className="space-y-2">
                      <Label className="font-semibold capitalize">
                        {key.replace(/_/g, ' ')}:
                      </Label>
                      <Input
                        value={value as string}
                        readOnly
                        className="bg-muted"
                      />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MetadataDDEXManagementSystem;
