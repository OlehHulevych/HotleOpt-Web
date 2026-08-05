import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Layout } from '../components/Layout'
import type { TaskTemplateDto, RoomType } from '../types/template'
import { getTemplatesByProperty } from '../api/templates'
import { useAuthStore } from '../store/authStore'
import { CreateTemplateModal } from './templates/CreateTemplateModal'
import { ApplyTemplateModal } from './templates/ApplyTemplateModal'

const ROOM_TYPE_STYLE: Record<RoomType, string> = {
  Single:  'bg-slate-500/10 text-slate-400',
  Double:  'bg-cyan-500/10 text-cyan-400',
  Twin:    'bg-violet-500/10 text-violet-400',
  Suite:   'bg-amber-500/10 text-amber-400',
  Deluxe:  'bg-emerald-500/10 text-emerald-400',
}

export function TemplatesPage() {
  const { t } = useTranslation()
  const user = useAuthStore((s) => s.user)
  const isManager = user?.role === 'Manager'
  const propertyId = user?.propertyId ?? ''

  const [templates, setTemplates] = useState<TaskTemplateDto[]>([])
  const [loading, setLoading] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [applyTarget, setApplyTarget] = useState<TaskTemplateDto | null>(null)

  const fetchTemplates = useCallback(() => {
    if (!propertyId) return
    setLoading(true)
    getTemplatesByProperty(propertyId)
      .then(setTemplates)
      .finally(() => setLoading(false))
  }, [propertyId])

  useEffect(() => { fetchTemplates() }, [fetchTemplates])

  return (
    <>
      <Layout>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-8">
            <div>
              <h1 className="text-xl font-semibold text-white">{t('templates.title')}</h1>
              <p className="text-slate-400 text-sm mt-0.5">{t('templates.subtitle')}</p>
            </div>
            {isManager && (
              <button
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {t('templates.newTemplate')}
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <svg className="animate-spin w-6 h-6 text-cyan-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-20 text-slate-500 text-sm">
              {t('templates.empty')}{isManager && ' Create one to get started.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((tpl) => (
                <div key={tpl.id} className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5 flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-white font-medium">{tpl.name}</p>
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded-md text-xs font-medium ${ROOM_TYPE_STYLE[tpl.roomType]}`}>
                        {tpl.roomType}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 shrink-0">{tpl.items.length} {t('templates.tasks')}</span>
                  </div>

                  <ul className="space-y-1.5">
                    {tpl.items.slice(0, 4).map((item) => (
                      <li key={item.id} className="flex items-center gap-2 text-sm text-slate-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-600 shrink-0" />
                        {item.title}
                      </li>
                    ))}
                    {tpl.items.length > 4 && (
                      <li className="text-xs text-slate-600 pl-3.5">+{tpl.items.length - 4} more…</li>
                    )}
                  </ul>

                  {isManager && (
                    <button
                      onClick={() => setApplyTarget(tpl)}
                      className="w-full mt-auto py-2 rounded-lg text-sm font-medium bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border border-cyan-500/20 transition-colors"
                    >
                      {t('templates.applyTemplate')}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </Layout>

      <CreateTemplateModal
        isOpen={showCreate}
        propertyId={propertyId}
        onClose={() => setShowCreate(false)}
        onSuccess={fetchTemplates}
      />

      <ApplyTemplateModal
        template={applyTarget}
        propertyId={propertyId}
        onClose={() => setApplyTarget(null)}
        onSuccess={fetchTemplates}
      />
    </>
  )
}
