export default function ErrorCard({ error }: { error: any }) {
    return (
        <div className="border border-red-500 rounded-lg p-4 relative overflow-hidden rounded-xl bg-white shadow-md">
            <div className="text-red-500 font-bold text-xl mb-2">Error</div>
            <div className="text-gray-700 text-base">
                {error.message}
            </div>
            <pre className="text-gray-700 text-base">{error.stack}</pre>
        </div>
    )
}
