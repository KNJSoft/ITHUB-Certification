import React, { useState, useEffect } from 'react';
import { adminService } from '../../api/services';
import { Shield, Smartphone, Globe, Clock, Activity, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

export const AdminSecurity: React.FC = () => {
  const [securityData, setSecurityData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'devices' | 'ips'>('devices');

  useEffect(() => {
    loadSecurityData();
  }, []);

  const loadSecurityData = async () => {
    try {
      setLoading(true);
      const data = await adminService.getSecurityData();
      setSecurityData(data);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des données de sécurité');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2563eb]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#f8fafc]">Sécurité</h1>
          <p className="text-[#94a3b8] mt-1">Gestion des appareils et adresses IP</p>
        </div>
        <button
          onClick={loadSecurityData}
          className="px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-lg flex items-center gap-2 transition-colors"
        >
          <Activity size={18} />
          Actualiser
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#1e293b] p-6 rounded-xl border border-[#334155]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#94a3b8] text-sm">Total Appareils</p>
              <p className="text-3xl font-bold text-[#f8fafc] mt-1">{securityData?.devices?.length || 0}</p>
            </div>
            <div className="w-12 h-12 bg-[#2563eb]/20 rounded-lg flex items-center justify-center">
              <Smartphone className="text-[#2563eb]" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-[#1e293b] p-6 rounded-xl border border-[#334155]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#94a3b8] text-sm">Appareils Actifs</p>
              <p className="text-3xl font-bold text-[#f8fafc] mt-1">
                {securityData?.devices?.filter((d: any) => d.active).length || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="text-green-500" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-[#1e293b] p-6 rounded-xl border border-[#334155]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#94a3b8] text-sm">Total IP</p>
              <p className="text-3xl font-bold text-[#f8fafc] mt-1">{securityData?.ips?.length || 0}</p>
            </div>
            <div className="w-12 h-12 bg-[#f59e0b]/20 rounded-lg flex items-center justify-center">
              <Globe className="text-[#f59e0b]" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-[#1e293b] p-6 rounded-xl border border-[#334155]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#94a3b8] text-sm">Utilisateurs Uniques</p>
              <p className="text-3xl font-bold text-[#f8fafc] mt-1">
                {new Set([...(securityData?.devices?.map((d: any) => d.user) || []), ...(securityData?.ips?.map((i: any) => i.user) || [])]).size}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Shield className="text-purple-500" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-[#1e293b] rounded-xl border border-[#334155]">
        <div className="flex border-b border-[#334155]">
          <button
            onClick={() => setActiveTab('devices')}
            className={`px-6 py-4 font-medium transition-colors ${
              activeTab === 'devices'
                ? 'text-[#2563eb] border-b-2 border-[#2563eb]'
                : 'text-[#94a3b8] hover:text-[#f8fafc]'
            }`}
          >
            <Smartphone size={18} className="inline mr-2" />
            Appareils
          </button>
          <button
            onClick={() => setActiveTab('ips')}
            className={`px-6 py-4 font-medium transition-colors ${
              activeTab === 'ips'
                ? 'text-[#2563eb] border-b-2 border-[#2563eb]'
                : 'text-[#94a3b8] hover:text-[#f8fafc]'
            }`}
          >
            <Globe size={18} className="inline mr-2" />
            Adresses IP
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'devices' ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-[#94a3b8] text-sm">
                    <th className="pb-4 font-medium">Utilisateur</th>
                    <th className="pb-4 font-medium">Appareil</th>
                    <th className="pb-4 font-medium">OS</th>
                    <th className="pb-4 font-medium">Navigateur</th>
                    <th className="pb-4 font-medium">IP</th>
                    <th className="pb-4 font-medium">Localisation</th>
                    <th className="pb-4 font-medium">Dernière connexion</th>
                    <th className="pb-4 font-medium">Statut</th>
                  </tr>
                </thead>
                <tbody className="text-[#f8fafc]">
                  {securityData?.devices?.map((device: any) => (
                    <tr key={device.id} className="border-t border-[#334155]">
                      <td className="py-4">{device.user}</td>
                      <td className="py-4">{device.name}</td>
                      <td className="py-4">{device.os}</td>
                      <td className="py-4">{device.browser}</td>
                      <td className="py-4">{device.ip_address || '-'}</td>
                      <td className="py-4">{device.location || '-'}</td>
                      <td className="py-4">{formatDate(device.last_login)}</td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          {device.active ? (
                            <span className="flex items-center gap-1 text-green-500 text-sm">
                              <CheckCircle size={14} />
                              Actif
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-red-500 text-sm">
                              <XCircle size={14} />
                              Inactif
                            </span>
                          )}
                          {device.is_primary && (
                            <span className="px-2 py-1 bg-[#2563eb]/20 text-[#2563eb] text-xs rounded-full">
                              Principal
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-[#94a3b8] text-sm">
                    <th className="pb-4 font-medium">Utilisateur</th>
                    <th className="pb-4 font-medium">Adresse IP</th>
                    <th className="pb-4 font-medium">Date d'enregistrement</th>
                    <th className="pb-4 font-medium">Device ID</th>
                  </tr>
                </thead>
                <tbody className="text-[#f8fafc]">
                  {securityData?.ips?.map((ip: any) => (
                    <tr key={ip.id} className="border-t border-[#334155]">
                      <td className="py-4">{ip.user}</td>
                      <td className="py-4 font-mono">{ip.ip}</td>
                      <td className="py-4">{formatDate(ip.created_at)}</td>
                      <td className="py-4 font-mono text-sm">{ip.device_id || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Blocked IPs/Devices Warning */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="text-amber-500 flex-shrink-0 mt-1" size={20} />
          <div>
            <h3 className="text-amber-500 font-semibold mb-2">IP et Appareils bloqués</h3>
            <p className="text-[#94a3b8] text-sm">
              Les IP et appareils qui dépassent le nombre de tentatives autorisées sont automatiquement bloqués pendant 5 minutes.
              Le rate limiting est géré côté frontend pour protéger contre les attaques par force brute.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
