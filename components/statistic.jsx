"use client"

import { useState, useEffect } from "react"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import {
  Calendar,
  ChevronDown,
  Download,
  TrendingUp,
  Users,
  Award,
  DollarSign,
  Clock,
  Filter,
  RefreshCw,
} from "lucide-react"

// Kolory dla wykresów
const BRANCH_COLORS = {
  Widzew: "#8884d8",
  Bałuty: "#82ca9d",
  Zgierz: "#ffc658",
  Górna: "#ff8042",
  Dąbrowa: "#0088fe",
  Retkinia: "#00C49F",
}

const COLORS = Object.values(BRANCH_COLORS)

export default function StatisticsDashboard() {
  const [timeRange, setTimeRange] = useState("year") // year, quarter, month
  const [year, setYear] = useState(2025)
  const [quarter, setQuarter] = useState(2) // 1-4
  const [month, setMonth] = useState(4) // 1-12
  const [selectedBranch, setSelectedBranch] = useState("all")
  const [showFilters, setShowFilters] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Dane statystyczne
  const [enrollmentData, setEnrollmentData] = useState([])
  const [revenueData, setRevenueData] = useState([])
  const [completionData, setCompletionData] = useState([])
  const [branchComparison, setBranchComparison] = useState([])
  const [yearlyTrends, setYearlyTrends] = useState([])
  const [summaryStats, setSummaryStats] = useState({
    totalEnrollments: 0,
    totalRevenue: 0,
    averageCompletion: 0,
    topBranch: "",
    growthRate: 0,
  })

  // Lista placówek
  const branches = ["Widzew", "Bałuty", "Zgierz", "Górna", "Dąbrowa", "Retkinia"]

  // Generowanie danych przykładowych
  useEffect(() => {
    loadData()
  }, [timeRange, year, quarter, month, selectedBranch])

  const loadData = () => {
    setIsLoading(true)

    // Symulacja ładowania danych z API
    setTimeout(() => {
      // Generowanie danych miesięcznych dla zapisów
      const monthlyData = []
      const months = ["Sty", "Lut", "Mar", "Kwi", "Maj", "Cze", "Lip", "Sie", "Wrz", "Paź", "Lis", "Gru"]

      for (let i = 0; i < 12; i++) {
        const monthData = {
          name: months[i],
          month: i + 1,
        }

        // Dodawanie danych dla każdej placówki
        branches.forEach((branch) => {
          // Symulacja różnych wartości dla różnych placówek
          let baseValue = Math.floor(Math.random() * 20) + 10

          // Dodajemy sezonowość - więcej zapisów na wiosnę i jesienią
          if (i >= 2 && i <= 4) baseValue += 15 // Wiosna (mar-maj)
          if (i >= 8 && i <= 10) baseValue += 10 // Jesień (wrz-lis)

          // Różne placówki mają różną popularność
          if (branch === "Widzew") baseValue *= 1.3
          if (branch === "Bałuty") baseValue *= 1.2
          if (branch === "Retkinia") baseValue *= 1.1
          if (branch === "Dąbrowa") baseValue *= 0.9

          monthData[branch] = Math.floor(baseValue)
        })

        // Dodawanie sumy dla wszystkich placówek
        monthData["Suma"] = branches.reduce((sum, branch) => sum + monthData[branch], 0)

        monthlyData.push(monthData)
      }

      // Filtrowanie danych na podstawie wybranego zakresu czasu
      let filteredData = [...monthlyData]
      if (timeRange === "quarter") {
        const startMonth = (quarter - 1) * 3
        filteredData = monthlyData.slice(startMonth, startMonth + 3)
      } else if (timeRange === "month") {
        filteredData = monthlyData.filter((item) => item.month === month)
      }

      // Filtrowanie danych na podstawie wybranej placówki
      if (selectedBranch !== "all") {
        filteredData = filteredData.map((item) => {
          const filtered = { name: item.name, month: item.month }
          filtered[selectedBranch] = item[selectedBranch]
          return filtered
        })
      }

      setEnrollmentData(filteredData)

      // Generowanie danych o przychodach (podobne do zapisów, ale z innymi wartościami)
      const revenueData = filteredData.map((item) => {
        const revenue = { ...item }
        branches.forEach((branch) => {
          if (revenue[branch]) {
            // Średnia cena kursu * liczba zapisów
            const avgCoursePrice = 2500 + Math.floor(Math.random() * 500)
            revenue[branch] = revenue[branch] * avgCoursePrice
          }
        })
        if (revenue["Suma"]) {
          revenue["Suma"] = branches.reduce((sum, branch) => sum + (revenue[branch] || 0), 0)
        }
        return revenue
      })
      setRevenueData(revenueData)

      // Generowanie danych o ukończeniach kursów
      const completionData = filteredData.map((item) => {
        const completion = { ...item }
        branches.forEach((branch) => {
          if (completion[branch]) {
            // Procent ukończonych kursów (70-95%)
            completion[branch + " %"] = 70 + Math.floor(Math.random() * 25)
          }
        })
        return completion
      })
      setCompletionData(completionData)

      // Porównanie placówek (suma zapisów w wybranym okresie)
      const branchComparisonData = branches.map((branch) => {
        const totalEnrollments = filteredData.reduce((sum, item) => sum + (item[branch] || 0), 0)
        return {
          name: branch,
          value: totalEnrollments,
        }
      })
      setBranchComparison(branchComparisonData)

      // Trendy roczne (suma zapisów na każdy miesiąc)
      setYearlyTrends(monthlyData)

      // Statystyki podsumowujące
      const totalEnrollments = filteredData.reduce((sum, item) => sum + (item["Suma"] || 0), 0)
      const totalRevenue = revenueData.reduce((sum, item) => sum + (item["Suma"] || 0), 0)

      // Znajdowanie najlepszej placówki
      let maxEnrollments = 0
      let topBranch = ""
      branches.forEach((branch) => {
        const branchTotal = filteredData.reduce((sum, item) => sum + (item[branch] || 0), 0)
        if (branchTotal > maxEnrollments) {
          maxEnrollments = branchTotal
          topBranch = branch
        }
      })

      // Średni procent ukończenia
      const avgCompletion =
        branches.reduce((sum, branch) => {
          const branchAvg =
            completionData.reduce((s, item) => s + (item[branch + " %"] || 0), 0) / completionData.length
          return sum + branchAvg
        }, 0) / branches.length

      // Wzrost w porównaniu do poprzedniego okresu (symulacja)
      const growthRate = Math.floor(Math.random() * 30) - 5 // -5% do +25%

      setSummaryStats({
        totalEnrollments,
        totalRevenue,
        averageCompletion: avgCompletion,
        topBranch,
        growthRate,
      })

      setIsLoading(false)
    }, 500)
  }

  // Formatowanie liczb
  const formatNumber = (num) => {
    return new Intl.NumberFormat("pl-PL").format(num)
  }

  // Formatowanie walut
  const formatCurrency = (num) => {
    return new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN" }).format(num)
  }

  // Pobieranie nazwy aktualnego okresu
  const getCurrentPeriodName = () => {
    const months = [
      "Styczeń",
      "Luty",
      "Marzec",
      "Kwiecień",
      "Maj",
      "Czerwiec",
      "Lipiec",
      "Sierpień",
      "Wrzesień",
      "Październik",
      "Listopad",
      "Grudzień",
    ]

    if (timeRange === "year") {
      return `Rok ${year}`
    } else if (timeRange === "quarter") {
      return `${quarter} kwartał ${year}`
    } else {
      return `${months[month - 1]} ${year}`
    }
  }

  // Eksport danych do CSV
  const exportToCSV = () => {
    // W rzeczywistej aplikacji tutaj byłby kod do generowania i pobierania pliku CSV
    alert("Funkcja eksportu danych do CSV zostanie zaimplementowana w przyszłości.")
  }

  return (
    <div className="bg-gray-50 min-h-screen p-6 overflow-x-scroll">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Panel Statystyczny</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <Filter className="w-5 h-5 mr-1" />
              Filtry
              <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </button>
            <button
              onClick={exportToCSV}
              className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <Download className="w-5 h-5 mr-1" />
              Eksportuj
            </button>
            <button
              onClick={loadData}
              className={`flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${
                isLoading ? "opacity-75 cursor-not-allowed" : ""
              }`}
              disabled={isLoading}
            >
              <RefreshCw className={`w-5 h-5 mr-1 ${isLoading ? "animate-spin" : ""}`} />
              Odśwież
            </button>
          </div>
        </div>

        {/* Filtry */}
        {showFilters && (
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Zakres czasu</label>
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="year">Cały rok</option>
                  <option value="quarter">Kwartał</option>
                  <option value="month">Miesiąc</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rok</label>
                <select
                  value={year}
                  onChange={(e) => setYear(Number.parseInt(e.target.value))}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="2023">2023</option>
                  <option value="2024">2024</option>
                  <option value="2025">2025</option>
                </select>
              </div>

              {timeRange === "quarter" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kwartał</label>
                  <select
                    value={quarter}
                    onChange={(e) => setQuarter(Number.parseInt(e.target.value))}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="1">I kwartał (Sty-Mar)</option>
                    <option value="2">II kwartał (Kwi-Cze)</option>
                    <option value="3">III kwartał (Lip-Wrz)</option>
                    <option value="4">IV kwartał (Paź-Gru)</option>
                  </select>
                </div>
              )}

              {timeRange === "month" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Miesiąc</label>
                  <select
                    value={month}
                    onChange={(e) => setMonth(Number.parseInt(e.target.value))}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="1">Styczeń</option>
                    <option value="2">Luty</option>
                    <option value="3">Marzec</option>
                    <option value="4">Kwiecień</option>
                    <option value="5">Maj</option>
                    <option value="6">Czerwiec</option>
                    <option value="7">Lipiec</option>
                    <option value="8">Sierpień</option>
                    <option value="9">Wrzesień</option>
                    <option value="10">Październik</option>
                    <option value="11">Listopad</option>
                    <option value="12">Grudzień</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Placówka</label>
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Wszystkie placówki</option>
                  {branches.map((branch) => (
                    <option key={branch} value={branch}>
                      {branch}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Karty z podsumowaniem */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-700">Łączna liczba zapisów</h3>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-gray-800">{formatNumber(summaryStats.totalEnrollments)}</div>
            <div className="mt-2 flex items-center">
              <span
                className={`text-sm ${
                  summaryStats.growthRate >= 0 ? "text-green-600" : "text-red-600"
                } flex items-center`}
              >
                <TrendingUp className="w-4 h-4 mr-1" />
                {summaryStats.growthRate >= 0 ? "+" : ""}
                {summaryStats.growthRate}%
              </span>
              <span className="text-sm text-gray-500 ml-2">vs poprzedni okres</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-700">Przychód</h3>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-gray-800">{formatCurrency(summaryStats.totalRevenue)}</div>
            <div className="mt-2 text-sm text-gray-500">
              Średnio {formatCurrency(summaryStats.totalRevenue / summaryStats.totalEnrollments)} na kursanta
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-700">Najlepsza placówka</h3>
              <Award className="w-8 h-8 text-yellow-500" />
            </div>
            <div className="text-3xl font-bold text-gray-800">{summaryStats.topBranch}</div>
            <div className="mt-2 text-sm text-gray-500">
              {formatNumber(branchComparison.find((item) => item.name === summaryStats.topBranch)?.value || 0)} zapisów
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-700">Średni % ukończenia</h3>
              <Clock className="w-8 h-8 text-purple-500" />
            </div>
            <div className="text-3xl font-bold text-gray-800">{Math.round(summaryStats.averageCompletion)}%</div>
            <div className="mt-2 text-sm text-gray-500">Ukończonych kursów</div>
          </div>
        </div>

        {/* Główny wykres zapisów */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">
              Liczba zapisów - {getCurrentPeriodName()}
              {selectedBranch !== "all" && ` - ${selectedBranch}`}
            </h2>
            <div className="text-sm text-gray-500 flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              Aktualizacja: {new Date().toLocaleDateString("pl-PL")}
            </div>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={enrollmentData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatNumber(value)} />
                <Legend />
                {selectedBranch === "all"
                  ? branches.map((branch, index) => (
                      <Bar
                        key={branch}
                        dataKey={branch}
                        fill={BRANCH_COLORS[branch] || COLORS[index % COLORS.length]}
                      />
                    ))
                  : [
                      <Bar
                        key={selectedBranch}
                        dataKey={selectedBranch}
                        fill={BRANCH_COLORS[selectedBranch] || COLORS[0]}
                      />,
                    ]}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sekcja z dwoma wykresami */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Wykres porównawczy placówek */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Porównanie placówek</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={branchComparison}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {branchComparison.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={BRANCH_COLORS[entry.name] || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatNumber(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Wykres trendów rocznych */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Trendy roczne</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={yearlyTrends}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatNumber(value)} />
                  <Legend />
                  {selectedBranch === "all" ? (
                    <Line type="monotone" dataKey="Suma" stroke="#8884d8" activeDot={{ r: 8 }} strokeWidth={2} />
                  ) : (
                    <Line
                      type="monotone"
                      dataKey={selectedBranch}
                      stroke={BRANCH_COLORS[selectedBranch] || "#8884d8"}
                      activeDot={{ r: 8 }}
                      strokeWidth={2}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Tabela z danymi */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Szczegółowe dane zapisów</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Miesiąc
                  </th>
                  {selectedBranch === "all"
                    ? branches.map((branch) => (
                        <th
                          key={branch}
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {branch}
                        </th>
                      ))
                    : [
                        <th
                          key={selectedBranch}
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {selectedBranch}
                        </th>,
                      ]}
                  {selectedBranch === "all" && (
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Suma
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {enrollmentData.map((item, index) => (
                  <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                    {selectedBranch === "all"
                      ? branches.map((branch) => (
                          <td key={branch} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatNumber(item[branch] || 0)}
                          </td>
                        ))
                      : [
                          <td key={selectedBranch} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatNumber(item[selectedBranch] || 0)}
                          </td>,
                        ]}
                    {selectedBranch === "all" && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatNumber(item["Suma"] || 0)}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Suma</td>
                  {selectedBranch === "all"
                    ? branches.map((branch) => (
                        <td key={branch} className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatNumber(enrollmentData.reduce((sum, item) => sum + (item[branch] || 0), 0))}
                        </td>
                      ))
                    : [
                        <td
                          key={selectedBranch}
                          className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
                        >
                          {formatNumber(enrollmentData.reduce((sum, item) => sum + (item[selectedBranch] || 0), 0))}
                        </td>,
                      ]}
                  {selectedBranch === "all" && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatNumber(enrollmentData.reduce((sum, item) => sum + (item["Suma"] || 0), 0))}
                    </td>
                  )}
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Dodatkowe statystyki */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Przychody */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Przychody</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={revenueData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `${value / 1000}k`} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  {selectedBranch === "all"
                    ? [<Bar key="Suma" dataKey="Suma" fill="#8884d8" />]
                    : [
                        <Bar
                          key={selectedBranch}
                          dataKey={selectedBranch}
                          fill={BRANCH_COLORS[selectedBranch] || "#8884d8"}
                        />,
                      ]}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Procent ukończenia kursów */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Procent ukończenia kursów</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={completionData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Legend />
                  {selectedBranch === "all"
                    ? branches.map((branch) => (
                        <Line
                          key={branch}
                          type="monotone"
                          dataKey={`${branch} %`}
                          stroke={BRANCH_COLORS[branch] || "#8884d8"}
                          strokeWidth={2}
                        />
                      ))
                    : [
                        <Line
                          key={selectedBranch}
                          type="monotone"
                          dataKey={`${selectedBranch} %`}
                          stroke={BRANCH_COLORS[selectedBranch] || "#8884d8"}
                          strokeWidth={2}
                        />,
                      ]}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
