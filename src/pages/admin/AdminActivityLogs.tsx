import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Activity, Filter, Download, Search, ChevronDown, RefreshCw } from "lucide-react";
import { useActivityLogs } from "@/hooks/useActivityLogs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";

const ACTION_COLORS: Record<string, string> = {
    create: "bg-green-100 text-green-800",
    update: "bg-blue-100 text-blue-800",
    delete: "bg-red-100 text-red-800",
    approve: "bg-emerald-100 text-emerald-800",
    reject: "bg-orange-100 text-orange-800",
    publish: "bg-purple-100 text-purple-800",
    unpublish: "bg-gray-100 text-gray-800",
    restore: "bg-cyan-100 text-cyan-800",
    bulk_action: "bg-indigo-100 text-indigo-800",
};

export default function AdminActivityLogs() {
    const { t } = useTranslation();
    const [actionTypeFilter, setActionTypeFilter] = useState<string>("all");
    const [entityTypeFilter, setEntityTypeFilter] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedLog, setSelectedLog] = useState<any>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    const { logs, loading, hasMore, loadMore, refresh } = useActivityLogs({
        actionType: actionTypeFilter !== "all" ? actionTypeFilter : undefined,
        entityType: entityTypeFilter !== "all" ? entityTypeFilter : undefined,
    });

    const filteredLogs = logs.filter((log) => {
        const searchLower = searchQuery.toLowerCase();
        return log.adminEmail.toLowerCase().includes(searchLower) || log.entityName?.toLowerCase().includes(searchLower) || log.entityType.toLowerCase().includes(searchLower) || log.actionType.toLowerCase().includes(searchLower);
    });

    const showDetails = (log: any) => {
        setSelectedLog(log);
        setShowDetailsModal(true);
    };

    const exportToCSV = () => {
        const headers = ["Date", "Admin", "Action", "Entity Type", "Entity", "IP Address"];
        const rows = filteredLogs.map((log) => [format(new Date(log.createdAt), "yyyy-MM-dd HH:mm:ss"), log.adminEmail, log.actionType, log.entityType, log.entityName || log.entityId, log.ipAddress || "N/A"]);

        const csvContent = [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `activity-logs-${Date.now()}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
                        <Activity className="w-8 h-8" />
                        {t("Activity Logs")}
                    </h1>
                    <p className="text-gray-600">{t("Track all admin actions and changes")}</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={refresh} variant="outline">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        {t("Refresh")}
                    </Button>
                    <Button onClick={exportToCSV} variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        {t("Export CSV")}
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input placeholder={t("Search logs...")} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
                </div>

                <Select value={actionTypeFilter} onValueChange={setActionTypeFilter}>
                    <SelectTrigger>
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue placeholder={t("All Actions")} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t("All Actions")}</SelectItem>
                        <SelectItem value="create">{t("Create")}</SelectItem>
                        <SelectItem value="update">{t("Update")}</SelectItem>
                        <SelectItem value="delete">{t("Delete")}</SelectItem>
                        <SelectItem value="approve">{t("Approve")}</SelectItem>
                        <SelectItem value="reject">{t("Reject")}</SelectItem>
                        <SelectItem value="publish">{t("Publish")}</SelectItem>
                        <SelectItem value="unpublish">{t("Unpublish")}</SelectItem>
                        <SelectItem value="bulk_action">{t("Bulk Action")}</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={entityTypeFilter} onValueChange={setEntityTypeFilter}>
                    <SelectTrigger>
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue placeholder={t("All Entities")} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t("All Entities")}</SelectItem>
                        <SelectItem value="product">{t("Product")}</SelectItem>
                        <SelectItem value="order">{t("Order")}</SelectItem>
                        <SelectItem value="review">{t("Review")}</SelectItem>
                        <SelectItem value="news">{t("News")}</SelectItem>
                        <SelectItem value="gallery">{t("Gallery")}</SelectItem>
                        <SelectItem value="content">{t("Content")}</SelectItem>
                        <SelectItem value="user">{t("User")}</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Logs List */}
            {loading && logs.length === 0 ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-24 bg-gray-100 animate-pulse rounded-lg"></div>
                    ))}
                </div>
            ) : filteredLogs.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">{t("No activity logs found")}</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {filteredLogs.map((log) => (
                        <Card key={log.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="py-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Badge className={ACTION_COLORS[log.actionType] || "bg-gray-100"}>{t(log.actionType)}</Badge>
                                            <span className="text-sm font-medium">{log.adminEmail}</span>
                                            <span className="text-xs text-gray-500">{format(new Date(log.createdAt), "PPp")}</span>
                                        </div>
                                        <p className="text-gray-700">
                                            {t(log.actionType)} {t(log.entityType)}: <span className="font-medium">{log.entityName || log.entityId}</span>
                                        </p>
                                        {log.ipAddress && <p className="text-xs text-gray-500 mt-1">IP: {log.ipAddress}</p>}
                                    </div>
                                    {log.changes && (
                                        <Button variant="ghost" size="sm" onClick={() => showDetails(log)}>
                                            {t("View Details")}
                                            <ChevronDown className="w-4 h-4 ml-1" />
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {hasMore && (
                        <div className="text-center mt-6">
                            <Button onClick={loadMore} variant="outline" disabled={loading}>
                                {loading ? t("Loading...") : t("Load More")}
                            </Button>
                        </div>
                    )}
                </div>
            )}

            {/* Details Modal */}
            <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{t("Activity Details")}</DialogTitle>
                    </DialogHeader>
                    {selectedLog && (
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-semibold mb-2">{t("Basic Information")}</h4>
                                <dl className="grid grid-cols-2 gap-2 text-sm">
                                    <dt className="text-gray-600">{t("Admin")}:</dt>
                                    <dd className="font-medium">{selectedLog.adminEmail}</dd>
                                    <dt className="text-gray-600">{t("Action")}:</dt>
                                    <dd className="font-medium">{selectedLog.actionType}</dd>
                                    <dt className="text-gray-600">{t("Entity")}:</dt>
                                    <dd className="font-medium">{selectedLog.entityType}</dd>
                                    <dt className="text-gray-600">{t("Date")}:</dt>
                                    <dd className="font-medium">{format(new Date(selectedLog.createdAt), "PPpp")}</dd>
                                    {selectedLog.ipAddress && (
                                        <>
                                            <dt className="text-gray-600">{t("IP Address")}:</dt>
                                            <dd className="font-medium">{selectedLog.ipAddress}</dd>
                                        </>
                                    )}
                                </dl>
                            </div>

                            {selectedLog.changes && (
                                <div>
                                    <h4 className="font-semibold mb-2">{t("Changes")}</h4>
                                    <div className="bg-gray-50 p-4 rounded-lg overflow-auto max-h-96">
                                        <pre className="text-xs">{JSON.stringify(selectedLog.changes, null, 2)}</pre>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
