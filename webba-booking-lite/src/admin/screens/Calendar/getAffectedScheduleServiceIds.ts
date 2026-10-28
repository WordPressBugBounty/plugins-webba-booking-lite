const readServiceIdList = (value: unknown): string[] => {
    if (Array.isArray(value)) {
        return value.map((id) => String(id)).filter((id) => id && id !== "0");
    }

    if (value && typeof value === "object") {
        return Object.values(value as Record<string, unknown>)
            .map((id) => String(id))
            .filter((id) => id && id !== "0");
    }

    if (typeof value !== "string") {
        return [];
    }

    const trimmed = value.trim();
    if (!trimmed || trimmed === "0") {
        return [];
    }

    try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
            return parsed.map((id) => String(id)).filter((id) => id && id !== "0");
        }
    } catch {
        return trimmed
            .split(",")
            .map((id) => id.trim())
            .filter((id) => id && id !== "0");
    }

    return trimmed
        .split(",")
        .map((id) => id.trim())
        .filter((id) => id && id !== "0");
};

const uniqueServiceIds = (serviceIds: string[]): string[] => {
    return Array.from(new Set(serviceIds.filter((id) => id && id !== "0")));
};

export const getAffectedScheduleServiceIds = (
    categories: any[],
    services: any[],
    serviceId: string | null,
    categoryId: string | null
): string[] => {
    const categoryList = Array.isArray(categories) ? categories : [];
    const serviceList = Array.isArray(services) ? services : [];
    const allServiceIds = uniqueServiceIds(
        serviceList.map((service) => String(service?.id ?? service?.value ?? ""))
    );

    if (categoryId && categoryId !== "0") {
        const category = categoryList.find(
            (item) => String(item?.id ?? item?.value ?? "") === String(categoryId)
        );
        const idsFromCategory = readServiceIdList(category?.list ?? category?.services);
        const idsFromServices = serviceList
            .filter((service) =>
                readServiceIdList(service?.categories ?? service?.service_categories).includes(
                    String(categoryId)
                )
            )
            .map((service) => String(service?.id ?? service?.value ?? ""));
        const categoryServiceIds = uniqueServiceIds([...idsFromCategory, ...idsFromServices]);

        return categoryServiceIds.length ? categoryServiceIds : allServiceIds;
    }

    if (serviceId && serviceId !== "0") {
        return [String(serviceId)];
    }

    return allServiceIds;
};
