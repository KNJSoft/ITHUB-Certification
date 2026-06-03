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
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#f8fafc]">Sécurité</h1>
          <p className="text-[#94a3b8] text-sm sm:text-base mt-1">Gestion des appareils et adresses IP</p>
        </div>
        <button
          onClick={loadSecurityData}
          className="px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-lg flex items-center gap-2 transition-colors text-sm sm:text-base"
        >
          <Activity size={16} />
          Actualiser
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#1e293b] p-4 sm:p-6 rounded-xl border border-[#334155]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#94a3b8] text-xs sm:text-sm">Total Appareils</p>
              <p className="text-2xl sm:text-3xl font-bold text-[#f8fafc] mt-1">{securityData?.devices?.length || 0}</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#2563eb]/20 rounded-lg flex items-center justify-center">
              <Smartphone className="text-[#2563eb]" size={18} />
            </div>
          </div>
        </div>

        <div className="bg-[#1e293b] p-4 sm:p-6 rounded-xl border border-[#334155]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#94a3b8] text-xs sm:text-sm">Appareils Actifs</p>
              <p className="text-2xl sm:text-3xl font-bold text-[#f8fafc] mt-1">
                {securityData?.devices?.filter((d: any) => d.active).length || 0}
              </p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="text-green-500" size={18} />
            </div>
          </div>
        </div>

        <div className="bg-[#1e293b] p-4 sm:p-6 rounded-xl border border-[#334155]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#94a3b8] text-xs sm:text-sm">Total IP</p>
              <p className="text-2xl sm:text-3xl font-bold text-[#f8fafc] mt-1">{securityData?.ips?.length || 0}</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#f59e0b]/20 rounded-lg flex items-center justify-center">
              <Globe className="text-[#f59e0b]" size={18} />
            </div>
          </div>
        </div>

        <div className="bg-[#1e293b] p-4 sm:p-6 rounded-xl border border-[#334155]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#94a3b8] text-xs sm:text-sm">Utilisateurs Uniques</p>
              <p className="text-2xl sm:text-3xl font-bold text-[#f8fafc] mt-1">
                {new Set([...(securityData?.devices?.map((d: any) => d.user) || []), ...(securityData?.ips?.map((i: any) => i.user) || [])]).size}
              </p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Shield className="text-purple-500" size={18} />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-[#1e293b] rounded-xl border border-[#334155]">
        <div className="flex border-b border-[#334155]">
          <button
            onClick={() => setActiveTab('devices')}
            className={`flex-1 sm:flex-none px-4 sm:px-6 py-3 sm:py-4 font-medium transition-colors text-xs sm:text-sm ${
              activeTab === 'devices'
                ? 'text-[#2563eb] border-b-2 border-[#2563eb]'
                : 'text-[#94a3b8] hover:text-[#f8fafc]'
            }`}
          >
            <Smartphone size={14} className="inline mr-1 sm:mr-2" />
            Appareils
          </button>
          <button
            onClick={() => setActiveTab('ips')}
            className={`flex-1 sm:flex-none px-4 sm:px-6 py-3 sm:py-4 font-medium transition-colors text-xs sm:text-sm ${
              activeTab === 'ips'
                ? 'text-[#2563eb] border-b-2 border-[#2563eb]'
                : 'text-[#94a3b8] hover:text-[#f8fafc]'
            }`}
          >
            <Globe size={14} className="inline mr-1 sm:mr-2" />
            Adresses IP
          </button>
        </div>

        <div className="p-4 sm:p-6">
          {activeTab === 'devices' ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-[#94a3b8] text-xs sm:text-sm">
                    <th className="pb-3 sm:pb-4 font-medium">Utilisateur</th>
                    <th className="pb-3 sm:pb-4 font-medium hidden sm:table-cell">Appareil</th>
                    <th className="pb-3 sm:pb-4 font-medium hidden md:table-cell">OS</th>
                    <th className="pb-3 sm:pb-4 font-medium hidden md:table-cell">Navigateur</th>
                    <th className="pb-3 sm:pb-4 font-medium hidden lg:table-cell">IP</th>
                    <th className="pb-3 sm:pb-4 font-medium hidden lg:table-cell">Localisation</th>
                    <th className="pb-3 sm:pb-4 font-medium hidden md:table-cell">Dernière connexion</th>
                    <th className="pb-3 sm:pb-4 font-medium">Statut</th>
                  </tr>
                </thead>
                <tbody className="text-[#f8fafc] text-xs sm:text-sm">
                  {securityData?.devices?.map((device: any) => (
                    <tr key={device.id} className="border-t border-[#334155]">
                      <td className="py-3 sm:py-4">{device.user}</td>
                      <td className="py-3 sm:py-4 hidden sm:table-cell">{device.name}</td>
                      <td className="py-3 sm:py-4 hidden md:table-cell">{device.os}</td>
                      <td className="py-3 sm:py-4 hidden md:table-cell">{device.browser}</td>
                      <td className="py-3 sm:py-4 hidden lg:table-cell">{device.ip_address || '-'}</td>
                      <td className="py-3 sm:py-4 hidden lg:table-cell">{device.location || '-'}</td>
                      <td className="py-3 sm:py-4 hidden md:table-cell">{formatDate(device.last_login)}</td>
                      <td className="py-3 sm:py-4">
                        <div className="flex items-center gap-1 sm:gap-2">
                          {device.active ? (
                            <span className="flex items-center gap-1 text-green-500 text-xs sm:text-sm">
                              <CheckCircle size={12} />
                              Actif
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-red-500 text-xs sm:text-sm">
                              <XCircle size={12} />
                              Inactif
                            </span>
                          )}
                          {device.is_primary && (
                            <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-[#2563eb]/20 text-[#2563eb] text-[9px] sm:text-xs rounded-full">
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
                  <tr className="text-left text-[#94a3b8] text-xs sm:text-sm">
                    <th className="pb-3 sm:pb-4 font-medium">Utilisateur</th>
                    <th className="pb-3 sm:pb-4 font-medium">Adresse IP</th>
                    <th className="pb-3 sm:pb-4 font-medium hidden sm:table-cell">Date d'enregistrement</th>
                    <th className="pb-3 sm:pb-4 font-medium hidden md:table-cell">Device ID</th>
                  </tr>
                </thead>
                <tbody className="text-[#f8fafc] text-xs sm:text-sm">
                  {securityData?.ips?.map((ip: any) => (
                    <tr key={ip.id} className="border-t border-[#334155]">
                      <td className="py-3 sm:py-4">{ip.user}</td>
                      <td className="py-3 sm:py-4 font-mono text-xs sm:text-sm">{ip.ip}</td>
                      <td className="py-3 sm:py-4 hidden sm:table-cell">{formatDate(ip.created_at)}</td>
                      <td className="py-3 sm:py-4 font-mono text-xs sm:text-sm hidden md:table-cell">{ip.device_id || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Blocked IPs/Devices Warning */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 sm:p-6">
        <div className="flex items-start gap-2 sm:gap-3">
          <AlertTriangle className="text-amber-500 flex-shrink-0 mt-0.5 sm:mt-1" size={16} />
          <div>
            <h3 className="text-amber-500 text-sm sm:text-base font-semibold mb-1 sm:mb-2">IP et Appareils bloqués</h3>
            <p className="text-[#94a3b8] text-xs sm:text-sm">
              Les IP et appareils qui dépassent le nombre de tentatives autorisées sont automatiquement bloqués pendant 5 minutes.
              Le rate limiting est géré côté frontend pour protéger contre les attaques par force brute.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
