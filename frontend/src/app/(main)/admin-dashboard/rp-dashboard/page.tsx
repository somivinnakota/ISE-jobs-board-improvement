import { getCompanies } from "@/app/api/utils";

export default async function AdminRpDashboard() {

    const companies = await getCompanies()
    console.log(companies)
}