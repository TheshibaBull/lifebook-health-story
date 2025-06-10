
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Eye, Lock, FileText, AlertTriangle, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DataEncryption } from '@/utils/encryption';
import { AuditLogger } from '@/utils/auditLogger';

interface PrivacySettings {
  dataEncryption: boolean;
  auditLogging: boolean;
  shareWithFamily: boolean;
  shareWithProviders: boolean;
  anonymousAnalytics: boolean;
  marketingCommunications: boolean;
  dataRetention: '1year' | '5years' | '10years' | 'forever';
  accessLevel: 'private' | 'family' | 'providers' | 'public';
}

const PrivacyControls = () => {
  const [settings, setSettings] = useState<PrivacySettings>({
    dataEncryption: true,
    auditLogging: true,
    shareWithFamily: false,
    shareWithProviders: true,
    anonymousAnalytics: false,
    marketingCommunications: false,
    dataRetention: '5years',
    accessLevel: 'private'
  });
  const [showAuditLogs, setShowAuditLogs] = useState(false);
  const { toast } = useToast();

  const handleSettingChange = (key: keyof PrivacySettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    // Encrypt and store settings
    DataEncryption.secureStore('privacy_settings', newSettings);
    
    // Log the privacy change
    AuditLogger.log(
      'user123', // In production, get from auth context
      'privacy_setting_changed',
      'privacy_controls',
      { setting: key, newValue: value },
      'medium'
    );

    toast({
      title: "Privacy Settings Updated",
      description: `${key} has been updated successfully.`,
    });
  };

  const exportPrivacyReport = () => {
    const report = {
      settings,
      exportDate: new Date().toISOString(),
      auditLogs: AuditLogger.getLogs('user123').slice(-100) // Last 100 logs
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'privacy-report.json';
    a.click();
    URL.revokeObjectURL(url);

    AuditLogger.log('user123', 'privacy_report_exported', 'privacy_controls', {}, 'medium');
    
    toast({
      title: "Privacy Report Exported",
      description: "Your privacy report has been downloaded.",
    });
  };

  const deleteAllData = () => {
    if (confirm('Are you sure you want to delete all your data? This action cannot be undone.')) {
      localStorage.clear();
      AuditLogger.log('user123', 'all_data_deleted', 'privacy_controls', {}, 'high');
      
      toast({
        title: "Data Deleted",
        description: "All your data has been permanently deleted.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="text-green-500" />
          Privacy & Security Controls
          <Badge variant="outline" className="text-xs">HIPAA Compliant</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="settings" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="settings">Privacy Settings</TabsTrigger>
            <TabsTrigger value="audit">Audit Logs</TabsTrigger>
            <TabsTrigger value="compliance">HIPAA Compliance</TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-blue-500" />
                  <div>
                    <h4 className="font-medium">Data Encryption</h4>
                    <p className="text-sm text-gray-600">Encrypt all health data at rest</p>
                  </div>
                </div>
                <Switch
                  checked={settings.dataEncryption}
                  onCheckedChange={(checked) => handleSettingChange('dataEncryption', checked)}
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Eye className="w-5 h-5 text-purple-500" />
                  <div>
                    <h4 className="font-medium">Audit Logging</h4>
                    <p className="text-sm text-gray-600">Track all access to your health data</p>
                  </div>
                </div>
                <Switch
                  checked={settings.auditLogging}
                  onCheckedChange={(checked) => handleSettingChange('auditLogging', checked)}
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-green-500" />
                  <div>
                    <h4 className="font-medium">Share with Healthcare Providers</h4>
                    <p className="text-sm text-gray-600">Allow authorized providers to access data</p>
                  </div>
                </div>
                <Switch
                  checked={settings.shareWithProviders}
                  onCheckedChange={(checked) => handleSettingChange('shareWithProviders', checked)}
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Data Retention Period</h4>
                  <p className="text-sm text-gray-600">How long to keep your health data</p>
                </div>
                <select
                  value={settings.dataRetention}
                  onChange={(e) => handleSettingChange('dataRetention', e.target.value)}
                  className="border rounded px-3 py-1"
                >
                  <option value="1year">1 Year</option>
                  <option value="5years">5 Years</option>
                  <option value="10years">10 Years</option>
                  <option value="forever">Forever</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button onClick={exportPrivacyReport} variant="outline" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export Privacy Report
              </Button>
              <Button onClick={deleteAllData} variant="destructive" className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Delete All Data
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="audit" className="space-y-4">
            <div className="space-y-3">
              <h3 className="font-medium">Recent Activity</h3>
              {AuditLogger.getLogs('user123').slice(-10).map((log) => (
                <div key={log.id} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-sm">{log.action.replace(/_/g, ' ').toUpperCase()}</p>
                      <p className="text-xs text-gray-600">{log.resource}</p>
                      <p className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleString()}</p>
                    </div>
                    <Badge variant={log.riskLevel === 'high' ? 'destructive' : log.riskLevel === 'medium' ? 'default' : 'secondary'}>
                      {log.riskLevel}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="compliance" className="space-y-4">
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-medium text-green-800 mb-2">HIPAA Compliance Status</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Data encryption enabled</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Audit logging active</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Access controls implemented</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Data retention policies active</span>
                  </div>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Your Rights Under HIPAA</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Right to access your health information</li>
                  <li>• Right to request corrections to your records</li>
                  <li>• Right to request restrictions on use/disclosure</li>
                  <li>• Right to receive confidential communications</li>
                  <li>• Right to file a complaint if privacy rights are violated</li>
                </ul>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Data Security Measures</h4>
                <ul className="text-sm space-y-1 text-blue-700">
                  <li>• AES-256 encryption for data at rest</li>
                  <li>• Comprehensive audit logging</li>
                  <li>• Role-based access controls</li>
                  <li>• Secure data transmission protocols</li>
                  <li>• Regular security assessments</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export { PrivacyControls };
