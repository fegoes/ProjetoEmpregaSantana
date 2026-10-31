export interface PublicJob {
  title: string; description_html: string|null; status?: string; expires_at?: string|null
  employment_type: string; created_at: string; location_city: string|null; location_state: string|null; is_remote: boolean
  pricing_model?: string; salary_visible: boolean; salary_min: number|null; salary_max: number|null; hourly_rate?: number|null
  empresas: {nome_fantasia:string;logo_url?:string|null;city?:string|null;state?:string|null}|null
}
export function isOpenJob(job: {status?:string;expires_at?:string|null},now=Date.now()) {
  return job.status==='published'&&(!job.expires_at||new Date(job.expires_at).getTime()>now)
}
export function buildJobPosting(job:PublicJob,url:string) {
  const employment:Record<string,string>={clt:'FULL_TIME',pj:'CONTRACTOR',temporario:'TEMPORARY',freelance:'CONTRACTOR'}
  const salary=job.salary_visible===true
  return {'@context':'https://schema.org','@type':'JobPosting',title:job.title,
    description:job.description_html||job.title,datePosted:job.created_at,url,
    ...(job.expires_at?{validThrough:job.expires_at}:{}),
    ...(employment[job.employment_type]?{employmentType:employment[job.employment_type]}:{}),
    hiringOrganization:{'@type':'Organization',name:job.empresas?.nome_fantasia??'EmpregaSantana',...(job.empresas?.logo_url?{logo:job.empresas.logo_url}:{})},
    ...(job.is_remote?{jobLocationType:'TELECOMMUTE',applicantLocationRequirements:{'@type':'Country',name:'BR'}}:{jobLocation:{'@type':'Place',address:{'@type':'PostalAddress',addressLocality:job.location_city??job.empresas?.city??undefined,addressRegion:job.location_state??job.empresas?.state??undefined,addressCountry:'BR'}}}),
    ...(salary&&job.pricing_model==='fixed_salary'&&job.salary_min!=null?{baseSalary:{'@type':'MonetaryAmount',currency:'BRL',value:{'@type':'QuantitativeValue',minValue:job.salary_min,...(job.salary_max!=null?{maxValue:job.salary_max}:{}),unitText:'MONTH'}}}:{}),
    ...(salary&&job.pricing_model==='hourly'&&job.hourly_rate!=null?{baseSalary:{'@type':'MonetaryAmount',currency:'BRL',value:{'@type':'QuantitativeValue',value:job.hourly_rate,unitText:'HOUR'}}}:{}),
  }
}
