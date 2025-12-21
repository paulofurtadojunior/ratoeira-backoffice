export const tabelas_particionadas = [
    {
      table_name: 'link_visita_acesso_parametro_v1',
      column: 'created_at',
      periodo_particao: 1, // em meses
      base: 'prd'
    },
    {
      table_name: 'google_campanha_source',
      column: 'created_at',
      periodo_particao: 1, // em meses
      base: 'metricas'
    },
    {
      table_name: 'google_campanha_source_historico',
      column: 'created_at',
      periodo_particao: 1, // em meses
      base: 'metricas'
    },
    {
      table_name: 'google_log_metrica',
      column: 'created_at',
      periodo_particao: 1, // em meses
      base: 'metricas'
    },
    {
      table_name: 'google_mcc_account_manager',
      column: 'created_at',
      periodo_particao: 1, // em meses
      base: 'metricas'
    },
    {
      table_name: 'google_metrica_ad_group_ad',
      column: 'created_at',
      periodo_particao: 1, // em meses
      base: 'metricas'
    },
    {
      table_name: 'google_metrica_campaign',
      column: 'created_at',
      periodo_particao: 1, // em meses
      base: 'metricas'
    },
    {
      table_name: 'google_metrica_keyword_view',
      column: 'created_at',
      periodo_particao: 1, // em meses
      base: 'metricas'
    },
    {
      table_name: 'link_visita_acesso_utms',
      column: 'created_at',
      periodo_particao: 1, // em meses
      base: 'metricas'
    }
  ];
  